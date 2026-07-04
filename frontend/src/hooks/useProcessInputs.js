import { useState, useCallback } from "react";
import { PROCESS_FIELDS, buildEmptyFormState } from "../config/processFields";

// Centralizes the 13-field form state so Prediction and Optimization
// pages can share one source of truth without duplicating logic.
export function useProcessInputs() {
  const [values, setValues] = useState(buildEmptyFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((key, rawValue) => {
    setValues((prev) => ({ ...prev, [key]: rawValue }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};

    PROCESS_FIELDS.forEach((field) => {
      const raw = values[field.key];

      if (raw === "" || raw === null || raw === undefined) {
        nextErrors[field.key] = "Required";
        return;
      }

      if (Number.isNaN(Number(raw))) {
        nextErrors[field.key] = "Must be numeric";
      }
    });

    setErrors(nextErrors);
    setTouched(
      PROCESS_FIELDS.reduce((acc, field) => {
        acc[field.key] = true;
        return acc;
      }, {})
    );

    return Object.keys(nextErrors).length === 0;
  }, [values]);

  // Converts current string values into the numeric payload the
  // backend expects. Only call after validate() returns true.
  const toPayload = useCallback(() => {
    const payload = {};
    PROCESS_FIELDS.forEach((field) => {
      payload[field.key] = Number(values[field.key]);
    });
    return payload;
  }, [values]);

  const reset = useCallback(() => {
    setValues(buildEmptyFormState());
    setErrors({});
    setTouched({});
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    validate,
    toPayload,
    reset,
  };
}
