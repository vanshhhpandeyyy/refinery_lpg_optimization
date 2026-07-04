import Navbar from "./Navbar";
import Tabs from "./Tabs";

function Header({ activeTab, onTabChange }) {
  return (
    <div className="app-header">
      <Navbar />
      <Tabs activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}

export default Header;
