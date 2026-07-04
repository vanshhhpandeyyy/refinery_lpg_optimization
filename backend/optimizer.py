import joblib
import pandas as pd
import numpy as np

# ==========================================================
# Load Model
# ==========================================================

model = joblib.load("models/lpg_model.pkl")
FEATURES = joblib.load("models/lpg_features.pkl")

# ==========================================================
# Industrial Constraints
# ==========================================================

CONSTRAINTS = {
    "Stabilizer Feed Flow": (320, 430),
    "Stabilizer Top P": (9, 15),
    "Stabilizer Reflux Flow": (25, 55),
    "Stabilizer Top T": (62, 85),
    "Stabiliser bottom level": (35, 65),
}

# ==========================================================
# Prediction Function
# ==========================================================

def predict_lpg(values):

    X = pd.DataFrame([values])

    X = X[FEATURES]

    prediction = model.predict(X)

    return float(prediction[0])

# ==========================================================
# Constraint Checker
# ==========================================================

def within_constraints(candidate):

    for feature, value in candidate.items():

        low, high = CONSTRAINTS[feature]

        if value < low or value > high:
            return False

    return True

# ==========================================================
# Main Optimization Function
# ==========================================================

def optimize(inputs):

    baseline = {

        "Stabilizer Feed T": inputs["Stabilizer_Feed_T"],
        "Stabilizer Feed Flow": inputs["Stabilizer_Feed_Flow"],
        "Stabilizer Top P": inputs["Stabilizer_Top_P"],
        "Stabilizer Reflux Drum T": inputs["Stabilizer_Reflux_Drum_T"],
        "Stabilized Naphtha Flow": inputs["Stabilized_Naphtha_Flow"],
        "Stabilizer Reflux Flow": inputs["Stabilizer_Reflux_Flow"],
        "HGO CR Flow": inputs["HGO_CR_Flow"],
        "HGO CR to reboiler Flow": inputs["HGO_CR_to_reboiler_Flow"],
        "Stabilizer Top T": inputs["Stabilizer_Top_T"],
        "Stabiliser bottom level": inputs["Stabiliser_bottom_level"],
        "Stabilier bottom pressure": inputs["Stabilier_bottom_pressure"],
        "HGO CR Reboiler Inlet Temp( TI-1914)": inputs["HGO_CR_Reboiler_Inlet_Temp_TI1914"],
        "Off Spec LPG from CRU inlet pressure": inputs["Off_Spec_LPG_from_CRU_inlet_pressure"],
    }

    current_lpg = predict_lpg(baseline)

    feed_flow_range = np.arange(300,451,30)

    top_p_range = np.arange(8,16.1,2)

    reflux_range = np.arange(20,61,10)

    top_temp_range = np.arange(60,91,6)

    bottom_level_range = np.arange(30,71,8)

    best_lpg = -999999

    best_settings = baseline.copy()

    skipped = 0

    for feed in feed_flow_range:

        for pressure in top_p_range:

            for reflux in reflux_range:

                for top_temp in top_temp_range:

                    for level in bottom_level_range:

                        candidate = baseline.copy()

                        candidate["Stabilizer Feed Flow"] = feed

                        candidate["Stabilizer Top P"] = pressure

                        candidate["Stabilizer Reflux Flow"] = reflux

                        candidate["Stabilizer Top T"] = top_temp

                        candidate["Stabiliser bottom level"] = level

                        if not within_constraints({

                            "Stabilizer Feed Flow": feed,

                            "Stabilizer Top P": pressure,

                            "Stabilizer Reflux Flow": reflux,

                            "Stabilizer Top T": top_temp,

                            "Stabiliser bottom level": level

                        }):

                            skipped += 1

                            continue

                        prediction = predict_lpg(candidate)

                        if prediction > best_lpg:

                            best_lpg = prediction

                            best_settings = candidate.copy()

    improvement = best_lpg - current_lpg

    improvement_percent = 0

    if current_lpg != 0:
        improvement_percent = (improvement / current_lpg) * 100

    summary = {
    "Current LPG": float(round(current_lpg, 3)),
    "Optimized LPG": float(round(best_lpg, 3)),
    "Improvement": float(round(improvement, 3)),
    "Improvement Percent": float(round(improvement_percent, 2)),
    "Combinations Skipped": int(skipped),
    "Recommended Settings": {
        "Stabilizer Feed Flow": float(best_settings["Stabilizer Feed Flow"]),
        "Stabilizer Top P": float(best_settings["Stabilizer Top P"]),
        "Stabilizer Reflux Flow": float(best_settings["Stabilizer Reflux Flow"]),
        "Stabilizer Top T": float(best_settings["Stabilizer Top T"]),
        "Stabiliser bottom level": float(best_settings["Stabiliser bottom level"])
    }
}

    return summary


# ==========================================================
# Testing
# ==========================================================

if __name__ == "__main__":

    sample = {

        "Stabilizer_Feed_T":150,
        "Stabilizer_Feed_Flow":380,
        "Stabilizer_Top_P":12,
        "Stabilizer_Reflux_Drum_T":55,
        "Stabilized_Naphtha_Flow":300,
        "Stabilizer_Reflux_Flow":40,
        "HGO_CR_Flow":200,
        "HGO_CR_to_reboiler_Flow":150,
        "Stabilizer_Top_T":70,
        "Stabiliser_bottom_level":50,
        "Stabilier_bottom_pressure":13,
        "HGO_CR_Reboiler_Inlet_Temp_TI1914":280,
        "Off_Spec_LPG_from_CRU_inlet_pressure":5

    }

    result = optimize(sample)

    print("="*60)

    print("OPTIMIZATION RESULT")

    print("="*60)

    print()

    for key,value in result.items():

        print(key)

        print(value)

        print()