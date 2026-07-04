import "./ResultCard.css";

/**
 * Displays the prediction as a physical-instrument-style digital readout.
 *
 * Props:
 *  - prediction: number | null  (the "Predicted LPG Flow" value from the API)
 *  - timestamp: Date | null     (when the prediction was made)
 *  - modelName: string          (e.g. "Random Forest")
 *  - requestError: string | null (network / API error message, if any)
 */
function ResultCard({ prediction, timestamp, modelName = "Random Forest", requestError }) {
  const hasResult = prediction !== null && prediction !== undefined;

  return (
    <section className="result-card" aria-labelledby="result-heading">
      <div className="result-card__strip">
        <span className={`result-card__led ${hasResult ? "result-card__led--on" : ""}`} />
        <span id="result-heading">LIVE READOUT</span>
      </div>

      <div className="result-card__body">
        <p className="result-card__label">Predicted LPG Flow</p>

        {requestError ? (
          <p className="result-card__error">{requestError}</p>
        ) : (
          <div className="result-card__reading">
            <span className="result-card__value">
              {hasResult ? prediction.toFixed(3) : "—.———"}
            </span>
            <span className="result-card__unit">TPH</span>
          </div>
        )}

        <div className="result-card__ticks" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>

      <div className="result-card__footer">
        <div className="result-card__meta">
          <span className="result-card__meta-label">Model</span>
          <span className="result-card__meta-value">{modelName}</span>
        </div>
        <div className="result-card__meta result-card__meta--right">
          <span className="result-card__meta-label">Timestamp</span>
          <span className="result-card__meta-value">
            {timestamp ? timestamp.toLocaleString() : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}

export default ResultCard;
