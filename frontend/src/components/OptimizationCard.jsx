function OptimizationCard({ loading, error, result, onOptimize, disabled }) {
  const improvementPositive = result ? result["Improvement Percent"] >= 0 : false;

  return (
    <div className="card optimization-card">
      <div className="card-header">
        <h2 className="card-title">Process Optimization</h2>
        {result && (
          <span className="card-subtitle">
            {result["Combinations Skipped"]} combinations skipped
          </span>
        )}
      </div>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={onOptimize}
        disabled={disabled || loading}
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {loading ? "Searching Best Operating Conditions..." : "Optimize Process"}
      </button>

      {error && <p className="form-error-text">{error}</p>}

      {result && (
        <div className="stat-row">
          <div className="stat-card">
            <span className="stat-label">Current LPG</span>
            <span className="stat-value">
              {result["Current LPG"].toFixed(2)} <span className="stat-unit">TPH</span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Optimized LPG</span>
            <span className="stat-value">
              {result["Optimized LPG"].toFixed(2)} <span className="stat-unit">TPH</span>
            </span>
          </div>

          <div className="stat-card stat-card-highlight">
            <span className="stat-label">Improvement</span>
            <span
              className={`stat-value ${improvementPositive ? "stat-value-positive" : ""}`}
            >
              {improvementPositive ? "+" : ""}
              {result["Improvement Percent"].toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OptimizationCard;
