import { useState } from "react";
import Header from "./components/Header";
import ProcessInputsForm from "./components/ProcessInputsForm";
import PredictionCard from "./components/PredictionCard";
import OptimizationCard from "./components/OptimizationCard";
import RecommendationTable from "./components/RecommendationTable";
import Footer from "./components/Footer";
import { useProcessInputs } from "./hooks/useProcessInputs";
import { predictLPG, optimizeProcess } from "./api/api";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("prediction");

  // Shared across both tabs so switching tabs never loses input values.
  const form = useProcessInputs();

  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [predictionValue, setPredictionValue] = useState(null);
  const [predictionTimestamp, setPredictionTimestamp] = useState(null);

  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [optimizationError, setOptimizationError] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);

  async function handlePredict() {
    setPredictionError(null);

    if (!form.validate()) {
      setPredictionError("Please fill in all fields with valid numbers.");
      return;
    }

    setPredictionLoading(true);
    try {
      const response = await predictLPG(form.toPayload());
      setPredictionValue(response.data["Predicted LPG Flow"]);
      setPredictionTimestamp(new Date());
    } catch (err) {
      setPredictionError(
        err.response?.data?.detail || "Prediction failed. Check the API connection."
      );
    } finally {
      setPredictionLoading(false);
    }
  }

  async function handleOptimize() {
    setOptimizationError(null);

    if (!form.validate()) {
      setOptimizationError("Please fill in all fields with valid numbers.");
      return;
    }

    setOptimizationLoading(true);
    try {
      const response = await optimizeProcess(form.toPayload());
      setOptimizationResult(response.data);
    } catch (err) {
      setOptimizationError(
        err.response?.data?.detail || "Optimization failed. Check the API connection."
      );
    } finally {
      setOptimizationLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app-main">
        {activeTab === "prediction" && (
          <div className="page-grid">
            <ProcessInputsForm
              values={form.values}
              errors={form.errors}
              touched={form.touched}
              onChange={form.handleChange}
              disabled={predictionLoading}
            />
            <PredictionCard
              loading={predictionLoading}
              error={predictionError}
              value={predictionValue}
              timestamp={predictionTimestamp}
              onPredict={handlePredict}
              disabled={predictionLoading}
            />
          </div>
        )}

        {activeTab === "optimization" && (
          <div className="page-grid">
            <ProcessInputsForm
              values={form.values}
              errors={form.errors}
              touched={form.touched}
              onChange={form.handleChange}
              disabled={optimizationLoading}
            />
            <div className="optimization-column">
              <OptimizationCard
                loading={optimizationLoading}
                error={optimizationError}
                result={optimizationResult}
                onOptimize={handleOptimize}
                disabled={optimizationLoading}
              />
              <RecommendationTable
                currentValues={form.values}
                recommendedSettings={optimizationResult?.["Recommended Settings"]}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
