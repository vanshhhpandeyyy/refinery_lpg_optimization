import { useState } from "react";

// Logo is loaded from /public/indianoil-logo.png so the file can be
// dropped in without touching any code or import paths.
// If it hasn't been added yet, a lightweight text badge is shown instead.
function Navbar() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-left">
        {!logoFailed ? (
          <img
            src="/indianoil-logo.png"
            alt="IndianOil"
            className="navbar-logo"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className="navbar-logo-fallback">IOCL</div>
        )}

        <div className="navbar-titles">
          <h1 className="navbar-title">IOCL LPG Optimization System</h1>
          <p className="navbar-subtitle">AI Decision Support System</p>
        </div>
      </div>

      <div className="navbar-right">
        <span className="badge badge-model">Random Forest</span>
      </div>
    </header>
  );
}

export default Navbar;
