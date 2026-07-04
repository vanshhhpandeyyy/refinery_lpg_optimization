import { PROCESS_FIELDS } from "../config/processFields";

function ProcessInputsForm({ values, errors, touched, onChange, disabled }) {
  return (
    <div className="card process-form-card">
      <div className="card-header">
        <h2 className="card-title">Process Inputs</h2>
        <span className="card-subtitle">{PROCESS_FIELDS.length} variables</span>
      </div>

      <div className="process-form-grid">
        {PROCESS_FIELDS.map((field) => {
          const hasError = touched[field.key] && errors[field.key];

          return (
            <div className="form-field" key={field.key}>
              <label className="form-label" htmlFor={field.key}>
                {field.label}
                <span className="form-unit">{field.unit}</span>
              </label>
              <input
                id={field.key}
                name={field.key}
                type="number"
                step="any"
                inputMode="decimal"
                required
                disabled={disabled}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                className={`form-input ${hasError ? "form-input-error" : ""}`}
              />
              {hasError && (
                <span className="form-error-text">{errors[field.key]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessInputsForm;
