import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import FooterPage from "./pages/FooterPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {console.log(import.meta.env)}
    <App />
    <FooterPage />
  </React.StrictMode>
);
