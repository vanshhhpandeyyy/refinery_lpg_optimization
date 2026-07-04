import "./LoadingSpinner.css";

/**
 * Small inline spinner used inside the Predict button,
 * plus a size variant for standalone use if ever needed.
 */
function LoadingSpinner({ size = 18 }) {
  return (
    <span
      className="loading-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;
