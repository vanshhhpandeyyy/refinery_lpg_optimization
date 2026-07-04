import axios from "axios";

// Backend base URL. Change this if the FastAPI service runs elsewhere.
const BASE_URL = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET / -> API info (model name, feature count)
export function getApiInfo() {
  return client.get("/");
}

// POST /predict_lpg -> { "Predicted LPG Flow": number }
export function predictLPG(payload) {
  return client.post("/predict_lpg", payload);
}

// POST /optimize -> optimization result object
export function optimizeProcess(payload) {
  return client.post("/optimize", payload);
}

export default client;
