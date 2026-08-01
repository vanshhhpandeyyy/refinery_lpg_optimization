from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

from optimizer import optimize

# ==========================================================
# FastAPI
# ==========================================================

app = FastAPI(
    title="IOCL LPG Prediction API",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Load Prediction Model
# ==========================================================

model = joblib.load("models/lpg_model.pkl")
features = joblib.load("models/lpg_features.pkl")
weather_model = joblib.load("models/weathering_classifier.pkl")
weather_features = joblib.load("models/weathering_features.pkl")

print("✅ LPG Model Loaded Successfully")
print("✅ Weathering Model Loaded Successfully")

# ==========================================================
# Input Schema
# ==========================================================

class LPGInput(BaseModel):

    Stabilizer_Feed_T: float
    Stabilizer_Feed_Flow: float
    Stabilizer_Top_P: float
    Stabilizer_Reflux_Drum_T: float
    Stabilized_Naphtha_Flow: float
    Stabilizer_Reflux_Flow: float
    HGO_CR_Flow: float
    HGO_CR_to_reboiler_Flow: float
    Stabiliser_bottom_level: float
    Stabilier_bottom_pressure: float
    HGO_CR_Reboiler_Inlet_Temp_TI1914: float
    Stabilizer_Top_T: float
    Off_Spec_LPG_from_CRU_inlet_pressure: float

class WeatheringInput(LPGInput):

    LPG_Flow: float

    Stabilizer_Top_T_2: float

    Stabilizer_Bottom_T: float

    Stab_3rd_Tray: float

    Stab_3rd_Tray_2: float

    Bottom_Reboiler_Inlet_Temp_TI1907: float

    Bottom_Reboiler_Outlet_Temp: float

    Bottom_Reboiler_Outlet_Temp_2: float

    Off_Spec_LPG_Flow: float


# ==========================================================
# Home
# ==========================================================

@app.get("/")
def home():

    return {

        "message":"IOCL LPG Optimization API",

        "model":"Random Forest",

        "features":len(features)

    }


# ==========================================================
# LPG Prediction
# ==========================================================

@app.post("/predict_lpg")

def predict(data: LPGInput):

    input_df = pd.DataFrame([{

        "Stabilizer Feed T": data.Stabilizer_Feed_T,

        "Stabilizer Feed Flow": data.Stabilizer_Feed_Flow,

        "Stabilizer Top P": data.Stabilizer_Top_P,

        "Stabilizer Reflux Drum T": data.Stabilizer_Reflux_Drum_T,

        "Stabilized Naphtha Flow": data.Stabilized_Naphtha_Flow,

        "Stabilizer Reflux Flow": data.Stabilizer_Reflux_Flow,

        "HGO CR Flow": data.HGO_CR_Flow,

        "HGO CR to reboiler Flow": data.HGO_CR_to_reboiler_Flow,

        "Stabilizer Top T": data.Stabilizer_Top_T,

        "Stabiliser bottom level": data.Stabiliser_bottom_level,

        "Stabilier bottom pressure": data.Stabilier_bottom_pressure,

        "HGO CR Reboiler Inlet Temp( TI-1914)": data.HGO_CR_Reboiler_Inlet_Temp_TI1914,

        "Off Spec LPG from CRU inlet pressure": data.Off_Spec_LPG_from_CRU_inlet_pressure

    }])

    input_df = input_df[features]

    prediction = model.predict(input_df)[0]

    return {
    "predicted_lpg": float(prediction)
}

@app.post("/predict_weathering")

def predict_weathering(data: WeatheringInput):

    X = pd.DataFrame([{

        "Stabilizer Feed T": data.Stabilizer_Feed_T,

        "Stabilizer Feed Flow": data.Stabilizer_Feed_Flow,

        "Stabilizer Top P": data.Stabilizer_Top_P,

        "Stabilizer Reflux Drum T": data.Stabilizer_Reflux_Drum_T,

        "Stabilized Naphtha Flow": data.Stabilized_Naphtha_Flow,

        "Stabilizer Reflux Flow": data.Stabilizer_Reflux_Flow,

        "HGO CR Flow": data.HGO_CR_Flow,

        "HGO CR to reboiler Flow": data.HGO_CR_to_reboiler_Flow,

        "LPG Flow": data.LPG_Flow,

        "Stabilizer Top T": data.Stabilizer_Top_T,

        "Stabilizer Top T.1": data.Stabilizer_Top_T_2,

        "Stabilizer Bottom T": data.Stabilizer_Bottom_T,

        "Stabiliser bottom level": data.Stabiliser_bottom_level,

        "Stabilier bottom pressure": data.Stabilier_bottom_pressure,

        "Stab. 3rd Tray": data.Stab_3rd_Tray,

        "Stab. 3rd Tray.1": data.Stab_3rd_Tray_2,

        "HGO CR Reboiler Inlet Temp( TI-1914)": data.HGO_CR_Reboiler_Inlet_Temp_TI1914,

        "Bottom Reboiler Naphtha Inlet Temp( TI-1907)": data.Bottom_Reboiler_Inlet_Temp_TI1907,

        "Bot. Naphtha Reboiler Outlet Temp(TI-1908 & TI-1909)": data.Bottom_Reboiler_Outlet_Temp,

        "Bot. Naphtha Reboiler Outlet Temp(TI-1908 & TI-1909).1": data.Bottom_Reboiler_Outlet_Temp_2,

        "Off Spec LPG flow (tag Faulty)": data.Off_Spec_LPG_Flow,

        "Off Spec LPG from CRU inlet pressure": data.Off_Spec_LPG_from_CRU_inlet_pressure

    }])

    X = X[weather_features]

    prediction = weather_model.predict(X)[0]

    probability = weather_model.predict_proba(X)[0][1]

    status = "GOOD" if prediction == 1 else "BAD"

    return {
        "weathering_status": status,
        "weathering_probability": float(probability)
    }


# ==========================================================
# Optimization Endpoint
# ==========================================================

# ==========================================================
# Optimization Endpoint
# ==========================================================

@app.post("/optimize")
def optimize_lpg(data: WeatheringInput):

    result = optimize(data.model_dump())

    return {
        "current_lpg": result["Current LPG"],
        "optimized_lpg": result["Optimized LPG"],
        "improvement": result["Improvement"],
        "improvement_percent": result["Improvement Percent"],
        "weathering_status": result["Weathering Status"],
        "weathering_probability": result["Weathering Probability"],
        "safe_operation": result["Safe Operation"],
        "safety_violations": result["Safety Violations"],
        "recommended_settings": result["Recommended Settings"]
    }