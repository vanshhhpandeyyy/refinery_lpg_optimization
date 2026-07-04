const TAB_ITEMS = [
  { id: "prediction", label: "Prediction" },
  { id: "optimization", label: "Optimization" },
];

function Tabs({ activeTab, onChange }) {
  return (
    <nav className="tabs">
      {TAB_ITEMS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-button ${activeTab === tab.id ? "tab-button-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default Tabs;
