import { useState } from "react";
import "./App.css";
import API from "./api/api";
import ioclLogo from "./assets/iocl.png";

const fields = [
  { label: "Stabilizer Feed Temperature", name: "Stabilizer_Feed_T", unit: "°C" },
  { label: "Stabilizer Feed Flow", name: "Stabilizer_Feed_Flow", unit: "m³/hr" },
  { label: "Stabilizer Top Pressure", name: "Stabilizer_Top_P", unit: "kg/cm²" },
  { label: "Stabilizer Reflux Drum Temperature", name: "Stabilizer_Reflux_Drum_T", unit: "°C" },
  { label: "Stabilized Naphtha Flow", name: "Stabilized_Naphtha_Flow", unit: "m³/hr" },
  { label: "Stabilizer Reflux Flow", name: "Stabilizer_Reflux_Flow", unit: "m³/hr" },
  { label: "HGO CR Flow", name: "HGO_CR_Flow", unit: "m³/hr" },
  { label: "HGO CR to Reboiler Flow", name: "HGO_CR_to_reboiler_Flow", unit: "m³/hr" },
  { label: "Stabilizer Bottom Level", name: "Stabiliser_bottom_level", unit: "%" },
  { label: "Stabilizer Bottom Pressure", name: "Stabilier_bottom_pressure", unit: "kg/cm²" },
  { label: "HGO CR Reboiler Inlet Temperature (TI-1914)", name: "HGO_CR_Reboiler_Inlet_Temp_TI1914", unit: "°C" },
  { label: "Stabilizer Top Temperature", name: "Stabilizer_Top_T", unit: "°C" },
  { label: "Off Spec LPG from CRU Inlet Pressure", name: "Off_Spec_LPG_from_CRU_inlet_pressure", unit: "kg/cm²" },
  { label: "LPG Flow", name: "LPG_Flow", unit: "m³/hr" },
  { label: "Stabilizer Top Temperature (Sensor 2)", name: "Stabilizer_Top_T_2", unit: "°C" },
  { label: "Stabilizer Bottom Temperature", name: "Stabilizer_Bottom_T", unit: "°C" },
  { label: "Stabilizer 3rd Tray Temperature", name: "Stab_3rd_Tray", unit: "°C" },
  { label: "Stabilizer 3rd Tray Temperature (Sensor 2)", name: "Stab_3rd_Tray_2", unit: "°C" },
  { label: "Bottom Reboiler Naphtha Inlet Temperature (TI-1907)", name: "Bottom_Reboiler_Inlet_Temp_TI1907", unit: "°C" },
  { label: "Bottom Reboiler Outlet Temperature (Sensor 1)", name: "Bottom_Reboiler_Outlet_Temp", unit: "°C" },
  { label: "Bottom Reboiler Outlet Temperature (Sensor 2)", name: "Bottom_Reboiler_Outlet_Temp_2", unit: "°C" },
  { label: "Off Spec LPG Flow", name: "Off_Spec_LPG_Flow", unit: "m³/hr" }
];

function App() {

  const initialData = {};

  fields.forEach((field) => {
    initialData[field.name] = "";
  });

  const [formData, setFormData] = useState(initialData);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const callAPI = async (endpoint, action) => {
    try {
      setLoading(true);
      setActiveAction(action);
      setResult(null);

      const response = await API.post(endpoint, formData);
      console.log(response.data);
      setResult(response.data);
    }
    catch (err) {
      console.error(err);
      alert("Request Failed");
    }
    finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setResult(null);
    setActiveAction("");
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "--";
    return Number(value).toFixed(2);
  };

  return (

    <div className="container">

      <div className="header">
        <img
          src={ioclLogo}
          alt="Indian Oil Logo"
          className="logo"
        />

        <div>
          <h1 className="title">
            Dashboard
          </h1>

          <p className="subtitle">
            LPG Prediction • Weathering Assessment • Process Optimization
          </p>
        </div>
      </div>

      <div className="button-group">

        <button
          disabled={loading}
          onClick={() => callAPI("/predict_lpg", "Predict LPG")}
        >
          Predict LPG
        </button>

        <button
          disabled={loading}
          onClick={() => callAPI("/predict_weathering", "Predict Weathering")}
        >
          Predict Weathering
        </button>

        <button
          disabled={loading}
          onClick={() => callAPI("/optimize", "Optimize Process")}
        >
          Optimize Process
        </button>

        <button
          className="reset-btn"
          onClick={resetForm}
        >
          Reset
        </button>

      </div>

      <div className="card">

        <h2>Process Parameters</h2>

        <div className="grid">

          {fields.map((field) => (

            <div className="input-group" key={field.name}>

              <label>
                {field.label}
                <span className="unit"> ({field.unit})</span>
              </label>

              <input
                type="number"
                step="any"
                placeholder="Enter value"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
              />

            </div>

          ))}

        </div>

      </div>

      <div className="card">

        <h2>Results</h2>

        {loading && (
          <div className="loading">
            Running {activeAction}...
          </div>
        )}

        {!loading && result && (

          <div className="result-card">

            <h3>{activeAction} Results</h3>

            {result.predicted_lpg !== undefined && (
              <p>
                <strong>Predicted LPG Flow :</strong>
                {formatNumber(result.predicted_lpg)} m³/hr
              </p>
            )}

            {result.current_lpg !== undefined && (
              <p>
                <strong>Current LPG Flow :</strong>
                {formatNumber(result.current_lpg)} m³/hr
              </p>
            )}

            {result.optimized_lpg !== undefined && (
              <p>
                <strong>Optimized LPG Flow :</strong>
                {formatNumber(result.optimized_lpg)} m³/hr
              </p>
            )}

            {result.improvement !== undefined && (
              <p>
                <strong>Improvement :</strong>
                +{formatNumber(result.improvement)}
              </p>
            )}

            {result.weathering_status && (
              <p>
                <strong>Weathering Status :</strong>
                <span
                  style={{
                    color:
                      result.weathering_status === "GOOD"
                        ? "green"
                        : "red",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  {result.weathering_status}
                </span>
              </p>
            )}

            {result.weathering_probability !== undefined && (
              <p>
                <strong>Weathering Probability :</strong>
                {(result.weathering_probability * 100).toFixed(2)}%
              </p>
            )}

            {result.safe_operation !== undefined && (
              <p>
                <strong>Safe Operation :</strong>
                {result.safe_operation ? "✅ Yes" : "❌ No"}
              </p>
            )}

            {/* Safety Violations — was duplicated/nested before, now a single block */}
            {result.safety_violations && result.safety_violations.length > 0 && (
              <>
                <h4>Safety Violations</h4>
                <ul>
                  {result.safety_violations.map((item, index) => (
                    <li key={index}>
                      <strong>{item.Feature}</strong><br />
                      Value : {item.Value}<br />
                      Allowed Range : {item["Allowed Range"]}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Recommended Settings — fixed: each object field is rendered
                individually instead of dumping the whole {Current, Recommended, Change}
                object into a single <td> */}
            {result.recommended_settings &&
              Object.keys(result.recommended_settings).length > 0 && (

                <>
                  <h4>Recommended Settings</h4>
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Current</th>
                        <th>Recommended</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.recommended_settings).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>{formatNumber(value.Current)}</td>
                            <td>{formatNumber(value.Recommended)}</td>
                            <td>
                              {value.Change > 0 ? "+" : ""}
                              {formatNumber(value.Change)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </>

            )}

          </div>

        )}

      </div>

    </div>

  );

}

export default App;