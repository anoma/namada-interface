import { AccountContextWrapper, VaultContextWrapper } from "context";
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { App } from "./App";

import "@namada/components/src/base.css";
import "../global.css";
import "../tailwind.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <VaultContextWrapper>
            <AccountContextWrapper>
              <App />
            </AccountContextWrapper>
          </VaultContextWrapper>
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>
  );
}
