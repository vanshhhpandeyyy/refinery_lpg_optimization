// Single source of truth for the 13 process variables.
// Keys MUST match the backend JSON contract exactly - do not rename.
export const PROCESS_FIELDS = [
  {
    key: "Stabilizer_Feed_T",
    label: "Stabilizer Feed Temperature",
    unit: "°C",
    placeholder: "e.g. 68.5",
  },
  {
    key: "Stabilizer_Feed_Flow",
    label: "Stabilizer Feed Flow",
    unit: "m³/h",
    placeholder: "e.g. 380",
  },
  {
    key: "Stabilizer_Top_P",
    label: "Stabilizer Top Pressure",
    unit: "kg/cm²",
    placeholder: "e.g. 12",
  },
  {
    key: "Stabilizer_Reflux_Drum_T",
    label: "Stabilizer Reflux Drum Temperature",
    unit: "°C",
    placeholder: "e.g. 45.2",
  },
  {
    key: "Stabilized_Naphtha_Flow",
    label: "Stabilized Naphtha Flow",
    unit: "m³/h",
    placeholder: "e.g. 210",
  },
  {
    key: "Stabilizer_Reflux_Flow",
    label: "Stabilizer Reflux Flow",
    unit: "m³/h",
    placeholder: "e.g. 40",
  },
  {
    key: "HGO_CR_Flow",
    label: "HGO CR Flow",
    unit: "m³/h",
    placeholder: "e.g. 155",
  },
  {
    key: "HGO_CR_to_reboiler_Flow",
    label: "HGO CR to Reboiler Flow",
    unit: "m³/h",
    placeholder: "e.g. 90",
  },
  {
    key: "Stabiliser_bottom_level",
    label: "Stabilizer Bottom Level",
    unit: "%",
    placeholder: "e.g. 50",
  },
  {
    key: "Stabilier_bottom_pressure",
    label: "Stabilizer Bottom Pressure",
    unit: "kg/cm²",
    placeholder: "e.g. 12.5",
  },
  {
    key: "HGO_CR_Reboiler_Inlet_Temp_TI1914",
    label: "HGO CR Reboiler Inlet Temp (TI-1914)",
    unit: "°C",
    placeholder: "e.g. 172",
  },
  {
    key: "Stabilizer_Top_T",
    label: "Stabilizer Top Temperature",
    unit: "°C",
    placeholder: "e.g. 70",
  },
  {
    key: "Off_Spec_LPG_from_CRU_inlet_pressure",
    label: "Off-Spec LPG from CRU Inlet Pressure",
    unit: "kg/cm²",
    placeholder: "e.g. 8.2",
  },
];

// Maps the recommendation table rows to:
// - the form field the current value comes from
// - the key returned inside "Recommended Settings" by /optimize
export const RECOMMENDATION_ROWS = [
  {
    label: "Feed Flow",
    unit: "m³/h",
    formKey: "Stabilizer_Feed_Flow",
    recommendedKey: "Stabilizer Feed Flow",
  },
  {
    label: "Top Pressure",
    unit: "kg/cm²",
    formKey: "Stabilizer_Top_P",
    recommendedKey: "Stabilizer Top P",
  },
  {
    label: "Reflux Flow",
    unit: "m³/h",
    formKey: "Stabilizer_Reflux_Flow",
    recommendedKey: "Stabilizer Reflux Flow",
  },
  {
    label: "Top Temperature",
    unit: "°C",
    formKey: "Stabilizer_Top_T",
    recommendedKey: "Stabilizer Top T",
  },
  {
    label: "Bottom Level",
    unit: "%",
    formKey: "Stabiliser_bottom_level",
    recommendedKey: "Stabiliser bottom level",
  },
];

// Empty default state built from PROCESS_FIELDS - keeps the form and the
// hook in sync without hand-maintaining a second object.
export function buildEmptyFormState() {
  const state = {};
  PROCESS_FIELDS.forEach((field) => {
    state[field.key] = "";
  });
  return state;
}
