function formatTimestamp(date) {
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PredictionCard({ loading, error, value, timestamp, onPredict, disabled }) {
  let statusLabel = "Idle";
  let statusClass = "status-idle";

  if (loading) {
    statusLabel = "Running";
    statusClass = "status-running";
  } else if (error) {
    statusLabel = "Failed";
    statusClass = "status-error";
  } else if (value !== null) {
    statusLabel = "Success";
    statusClass = "status-success";
  }

  return (
    <div className="card prediction-card">
      <div className="card-header">
        <h2 className="card-title">Predicted LPG Flow</h2>
        <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="prediction-value-block">
        {value !== null ? (
          <>
            <span className="prediction-value">{value.toFixed(2)}</span>
            <span className="prediction-value-unit">TPH</span>
          </>
        ) : (
          <span className="prediction-value-placeholder">
            {loading ? "Calculating..." : "No prediction yet"}
          </span>
        )}
      </div>

      {error && <p className="form-error-text">{error}</p>}

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={onPredict}
        disabled={disabled || loading}
      >
        {loading ? "Predicting..." : "Predict LPG Flow"}
      </button>

      <dl className="prediction-meta">
        <div className="prediction-meta-row">
          <dt>Model</dt>
          <dd>Random Forest</dd>
        </div>
        <div className="prediction-meta-row">
          <dt>Last Updated</dt>
          <dd>{formatTimestamp(timestamp)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default PredictionCard;
