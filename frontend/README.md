# IOCL LPG Optimization System - Frontend

## Setup
npm install
npm run dev

Runs on http://localhost:5173 and calls the FastAPI backend at http://127.0.0.1:8000.
Make sure the backend is running first.

## Add the logo
Drop the IndianOil logo file into:
  public/indianoil-logo.png

Navbar.jsx already references it - no code changes needed.
If the file isn't there yet, a text "IOCL" badge shows automatically instead.

## Structure
src/
  api/api.js                 - axios calls to /predict_lpg and /optimize
  config/processFields.js    - the 13 field definitions + recommendation mapping
  hooks/useProcessInputs.js  - shared form state/validation (used by both tabs)
  components/                - Navbar, Tabs, Header, form, cards, table, footer
  App.jsx / App.css          - page assembly + styling
