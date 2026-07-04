import { RECOMMENDATION_ROWS } from "../config/processFields";

function RecommendationTable({ currentValues, recommendedSettings }) {
  if (!recommendedSettings) return null;

  return (
    <div className="card recommendation-card">
      <div className="card-header">
        <h2 className="card-title">Recommended Settings</h2>
      </div>

      <table className="recommendation-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Current</th>
            <th>Recommended</th>
          </tr>
        </thead>
        <tbody>
          {RECOMMENDATION_ROWS.map((row) => {
            const current = Number(currentValues[row.formKey]);
            const recommended = recommendedSettings[row.recommendedKey];

            return (
              <tr key={row.formKey}>
                <td>{row.label}</td>
                <td>
                  {Number.isFinite(current) ? current : "—"}{" "}
                  <span className="table-unit">{row.unit}</span>
                </td>
                <td className="recommendation-value">
                  {recommended}{" "}
                  <span className="table-unit">{row.unit}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RecommendationTable;
