import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import "./tailwind.css";

const container = document.getElementById("root")!;
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
