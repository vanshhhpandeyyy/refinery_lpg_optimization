import "./InputField.css";

/**
 * A single labeled process-variable input.
 *
 * Props:
 *  - id, name: form field key (matches backend schema field name)
 *  - label: human-readable label shown above the input
 *  - unit: engineering unit shown next to the label (e.g. "°C", "TPH")
 *  - value, onChange: controlled input state
 *  - error: validation message string (shown + styles input red) or null
 */
function InputField({ id, name, label, unit, value, onChange, error }) {
  return (
    <div className="input-field">
      <label htmlFor={id} className="input-field__label">
        {label}
        {unit && <span className="input-field__unit">{unit}</span>}
      </label>

      <input
        id={id}
        name={name}
        type="number"
        step="any"
        inputMode="decimal"
        placeholder="Enter value"
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input-field__control ${error ? "input-field__control--error" : ""}`}
      />

      {error && (
        <p id={`${id}-error`} className="input-field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
