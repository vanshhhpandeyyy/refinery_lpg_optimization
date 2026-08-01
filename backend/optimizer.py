import joblib
import pandas as pd
import numpy as np
from itertools import product

# ==========================================================
# Load Trained Models
# ==========================================================

lpg_model = joblib.load("models/lpg_model.pkl")
LPG_FEATURES = joblib.load("models/lpg_features.pkl")

weather_model = joblib.load("models/weathering_classifier.pkl")
WEATHER_FEATURES = joblib.load("models/weathering_features.pkl")


# ==========================================================
# Historical Dataset
# Used only for operating limits
# ==========================================================

df_clean = pd.read_csv(
    r"D:\Projects\lpg_flow_prediction\data\df_clean.csv"
)

SAFE_LIMITS = {}

for col in df_clean.columns:
    if col == "DATE":
        continue
    if pd.api.types.is_numeric_dtype(df_clean[col]):
        SAFE_LIMITS[col] = (
            float(df_clean[col].quantile(0.05)),
            float(df_clean[col].quantile(0.95))
        )


# ==========================================================
# Variables Operator Can Control
# ==========================================================

CONTROL_VARIABLES = [
    "Stabilizer Feed Flow",
    "Stabilizer Top P",
    "Stabilizer Reflux Flow",
    "Stabilizer Top T",
    "Stabiliser bottom level"
]


# ==========================================================
# Single-row predictions (still used for the CURRENT point)
# ==========================================================

def predict_lpg(values):
    X = pd.DataFrame([values])[LPG_FEATURES]
    return float(lpg_model.predict(X)[0])


def predict_weathering(values):
    X = pd.DataFrame([values])[WEATHER_FEATURES]
    prediction = weather_model.predict(X)[0]
    probability = weather_model.predict_proba(X)[0][1]
    return int(prediction), float(probability)


# ==========================================================
# BATCH predictions — the actual fix.
# Instead of calling model.predict() once per candidate row
# (thousands of calls), we build ALL candidate rows into a
# single DataFrame and call model.predict()/predict_proba()
# ONE time on the whole batch. This is what removes the
# "runs forever" behaviour.
# ==========================================================

def predict_lpg_batch(df):
    X = df[LPG_FEATURES]
    return lpg_model.predict(X)


def predict_weathering_batch(df):
    X = df[WEATHER_FEATURES]
    preds = weather_model.predict(X)
    probs = weather_model.predict_proba(X)[:, 1]
    return preds, probs


# ==========================================================
# Historical Range Check
# ==========================================================

def check_safe_ranges(candidate):
    violations = []
    for feature in CONTROL_VARIABLES:
        if feature not in SAFE_LIMITS:
            continue
        value = candidate[feature]
        low, high = SAFE_LIMITS[feature]
        if value < low:
            violations.append({
                "Feature": feature,
                "Value": round(float(value), 3),
                "Allowed Range": f"{round(low,3)} - {round(high,3)}",
                "Status": "LOW"
            })
        elif value > high:
            violations.append({
                "Feature": feature,
                "Value": round(float(value), 3),
                "Allowed Range": f"{round(low,3)} - {round(high,3)}",
                "Status": "HIGH"
            })
    return violations


# ==========================================================
# Generate LOCAL Search Space
# ==========================================================

def local_search(current_value, feature, percent=0.05, points=5):
    low_hist, high_hist = SAFE_LIMITS[feature]
    low = max(low_hist, current_value * (1 - percent))
    high = min(high_hist, current_value * (1 + percent))
    return np.unique(
        np.concatenate([np.linspace(low, high, points), [current_value]])
    )


# ==========================================================
# Vectorized Movement Penalty (applied to a whole DataFrame
# at once instead of row-by-row)
# ==========================================================

def movement_penalty_batch(df, current):
    total = np.zeros(len(df))
    for feature in CONTROL_VARIABLES:
        low, high = SAFE_LIMITS[feature]
        span = high - low
        if span <= 0:
            continue
        total += (df[feature] - current[feature]).abs() / span
    return total


def calculate_score_batch(predicted_lpg, weather_probability, movement):
    return predicted_lpg + weather_probability * 8 - movement * 2


# ==========================================================
# Optimization (vectorized)
# ==========================================================

def optimize(inputs):

    # ------------------------------------------------------
    # Build Current Plant State
    # ------------------------------------------------------

    baseline = {
        "Stabilizer Feed T": inputs["Stabilizer_Feed_T"],
        "Stabilizer Feed Flow": inputs["Stabilizer_Feed_Flow"],
        "Stabilizer Top P": inputs["Stabilizer_Top_P"],
        "Stabilizer Reflux Drum T": inputs["Stabilizer_Reflux_Drum_T"],
        "Stabilized Naphtha Flow": inputs["Stabilized_Naphtha_Flow"],
        "Stabilizer Reflux Flow": inputs["Stabilizer_Reflux_Flow"],
        "HGO CR Flow": inputs["HGO_CR_Flow"],
        "HGO CR to reboiler Flow": inputs["HGO_CR_to_reboiler_Flow"],
        "LPG Flow": 0,
        "Stabilizer Top T": inputs["Stabilizer_Top_T"],
        "Stabilizer Top T.1": inputs["Stabilizer_Top_T_2"],
        "Stabilizer Bottom T": inputs["Stabilizer_Bottom_T"],
        "Stabiliser bottom level": inputs["Stabiliser_bottom_level"],
        "Stabilier bottom pressure": inputs["Stabilier_bottom_pressure"],
        "Stab. 3rd Tray": inputs["Stab_3rd_Tray"],
        "Stab. 3rd Tray.1": inputs["Stab_3rd_Tray_2"],
        "HGO CR Reboiler Inlet Temp( TI-1914)":
            inputs["HGO_CR_Reboiler_Inlet_Temp_TI1914"],
        "Bottom Reboiler Naphtha Inlet Temp( TI-1907)":
            inputs["Bottom_Reboiler_Inlet_Temp_TI1907"],
        "Bot. Naphtha Reboiler Outlet Temp(TI-1908 & TI-1909)":
            inputs["Bottom_Reboiler_Outlet_Temp"],
        "Bot. Naphtha Reboiler Outlet Temp(TI-1908 & TI-1909).1":
            inputs["Bottom_Reboiler_Outlet_Temp_2"],
        "Off Spec LPG flow (tag Faulty)":
            inputs["Off_Spec_LPG_Flow"],
        "Off Spec LPG from CRU inlet pressure":
            inputs["Off_Spec_LPG_from_CRU_inlet_pressure"]
    }

    # ------------------------------------------------------
    # Current Plant Prediction
    # ------------------------------------------------------

    current_lpg = predict_lpg(baseline)
    baseline["LPG Flow"] = current_lpg
    current_weather, current_probability = predict_weathering(baseline)

    best_settings = baseline.copy()
    best_lpg = current_lpg
    best_probability = current_probability
    best_score = calculate_score_batch(
        np.array([current_lpg]),
        np.array([current_probability]),
        np.array([0.0])
    )[0]

    # ------------------------------------------------------
    # LOCAL SEARCH SPACE
    # ------------------------------------------------------

    feed_range = local_search(baseline["Stabilizer Feed Flow"], "Stabilizer Feed Flow")
    pressure_range = local_search(baseline["Stabilizer Top P"], "Stabilizer Top P")
    reflux_range = local_search(baseline["Stabilizer Reflux Flow"], "Stabilizer Reflux Flow")
    top_temp_range = local_search(baseline["Stabilizer Top T"], "Stabilizer Top T")
    level_range = local_search(baseline["Stabiliser bottom level"], "Stabiliser bottom level")

    print("\n========== Optimization ==========")
    print("Current LPG :", round(current_lpg, 3))
    print("Weather Probability :", round(current_probability, 3))
    print("----------------------------------")

    # ------------------------------------------------------
    # Build ALL candidate rows at once (this replaces the
    # 5-deep nested for-loop that called the models one row
    # at a time)
    # ------------------------------------------------------

    combos = list(product(feed_range, pressure_range, reflux_range,
                           top_temp_range, level_range))

    candidates = pd.DataFrame([baseline.copy() for _ in range(len(combos))])
    combos_arr = np.array(combos)

    candidates["Stabilizer Feed Flow"] = combos_arr[:, 0]
    candidates["Stabilizer Top P"] = combos_arr[:, 1]
    candidates["Stabilizer Reflux Flow"] = combos_arr[:, 2]
    candidates["Stabilizer Top T"] = combos_arr[:, 3]
    candidates["Stabiliser bottom level"] = combos_arr[:, 4]

    combinations_checked = len(candidates)

    # -----------------------------------
    # ONE batched call for LPG, not one call per row
    # -----------------------------------
    predicted_lpg_arr = predict_lpg_batch(candidates)
    candidates["LPG Flow"] = predicted_lpg_arr

    # -----------------------------------
    # ONE batched call for weathering, not one call per row
    # -----------------------------------
    weather_class_arr, weather_prob_arr = predict_weathering_batch(candidates)

    # -----------------------------------
    # Reject poor quality (vectorized)
    # -----------------------------------
    keep_mask = weather_prob_arr >= 0.60
    combinations_rejected = int((~keep_mask).sum())

    kept = candidates[keep_mask].copy()
    kept_lpg = predicted_lpg_arr[keep_mask]
    kept_prob = weather_prob_arr[keep_mask]

    if len(kept) > 0:
        movement = movement_penalty_batch(kept, baseline).values
        scores = calculate_score_batch(kept_lpg, kept_prob, movement)

        best_idx_local = int(np.argmax(scores))
        if scores[best_idx_local] > best_score:
            best_score = float(scores[best_idx_local])
            best_lpg = float(kept_lpg[best_idx_local])
            best_probability = float(kept_prob[best_idx_local])
            best_settings = kept.iloc[best_idx_local].to_dict()

    # ------------------------------------------------------
    # Final Statistics
    # ------------------------------------------------------

    improvement = best_lpg - current_lpg
    improvement_percent = (improvement / current_lpg) * 100 if current_lpg != 0 else 0

    violations = check_safe_ranges(best_settings)

    confidence = min(
        100,
        round(best_probability * 100 + max(0, improvement_percent) * 0.4, 2)
    )

    recommended_settings = {}
    for feature in CONTROL_VARIABLES:
        current_value = baseline[feature]
        recommended_value = best_settings[feature]
        if abs(current_value - recommended_value) < 1e-6:
            continue
        recommended_settings[feature] = {
            "Current": round(float(current_value), 3),
            "Recommended": round(float(recommended_value), 3),
            "Change": round(float(recommended_value - current_value), 3)
        }

    summary = {
        "Current LPG": round(float(current_lpg), 3),
        "Optimized LPG": round(float(best_lpg), 3),
        "Improvement": round(float(improvement), 3),
        "Improvement Percent": round(float(improvement_percent), 2),
        "Weathering Status": "GOOD" if best_probability >= 0.60 else "BAD",
        "Weathering Probability": round(float(best_probability), 3),
        "Optimization Confidence": confidence,
        "Safe Operation": len(violations) == 0,
        "Safety Violations": violations,
        "Combinations Checked": combinations_checked,
        "Combinations Rejected": combinations_rejected,
        "Optimization Score": round(float(best_score), 3),
        "Recommended Settings": recommended_settings
    }

    print()
    print("========== RESULT ==========")
    print("Current LPG :", round(current_lpg, 3))
    print("Optimized LPG :", round(best_lpg, 3))
    print("Improvement :", round(improvement, 3))
    print("Weather Probability :", round(best_probability, 3))
    print("Optimization Score :", round(best_score, 3))
    print("Confidence :", confidence, "%")
    print("============================")

    return summary