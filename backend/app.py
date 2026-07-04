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

print("✅ LPG Model Loaded Successfully")

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

    prediction = model.predict(input_df)

    return {

        "Predicted LPG Flow": round(float(prediction[0]),3)

    }


# ==========================================================
# Optimization Endpoint
# ==========================================================

@app.post("/optimize")

def optimize_lpg(data: LPGInput):

    result = optimize({

        "Stabilizer_Feed_T": data.Stabilizer_Feed_T,

        "Stabilizer_Feed_Flow": data.Stabilizer_Feed_Flow,

        "Stabilizer_Top_P": data.Stabilizer_Top_P,

        "Stabilizer_Reflux_Drum_T": data.Stabilizer_Reflux_Drum_T,

        "Stabilized_Naphtha_Flow": data.Stabilized_Naphtha_Flow,

        "Stabilizer_Reflux_Flow": data.Stabilizer_Reflux_Flow,

        "HGO_CR_Flow": data.HGO_CR_Flow,

        "HGO_CR_to_reboiler_Flow": data.HGO_CR_to_reboiler_Flow,

        "Stabilizer_Top_T": data.Stabilizer_Top_T,

        "Stabiliser_bottom_level": data.Stabiliser_bottom_level,

        "Stabilier_bottom_pressure": data.Stabilier_bottom_pressure,

        "HGO_CR_Reboiler_Inlet_Temp_TI1914": data.HGO_CR_Reboiler_Inlet_Temp_TI1914,

        "Off_Spec_LPG_from_CRU_inlet_pressure": data.Off_Spec_LPG_from_CRU_inlet_pressure

    })

    return result