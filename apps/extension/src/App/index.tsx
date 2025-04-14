import {
  AccountContextWrapper,
  SettingsContextProvider,
  VaultContextWrapper,
} from "context";
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { App } from "./App";

import "@namada/components/src/base.css";
import "../global.css";
import "../tailwind.css";

const container = document.getElementById("root")!;
createRoot(container).render(
  <React.StrictMode>
    <HashRouter>
      <RequesterProvider>
        <VaultContextWrapper>
          <AccountContextWrapper>
            <SettingsContextProvider>
              <App />
            </SettingsContextProvider>
          </AccountContextWrapper>
        </VaultContextWrapper>
      </RequesterProvider>
    </HashRouter>
  </React.StrictMode>
);
