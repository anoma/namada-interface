import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { Approvals } from "./Approvals";

import "@namada/components/src/base.css";
import "../global.css";
import "../tailwind.css";

// Needed to allow displaying tx details containing bigints e.g. proposals
import "@namada/utils/bigint-to-json-polyfill";

const container = document.getElementById("root")!;
createRoot(container).render(
  <React.StrictMode>
    <HashRouter>
      <RequesterProvider>
        <Approvals />
      </RequesterProvider>
    </HashRouter>
  </React.StrictMode>
);
