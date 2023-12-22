import { AccountContextWrapper, VaultContextWrapper } from "context";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { App } from "./App";

import "@namada/components/src/base.css";
import "../global.css";
import "../tailwind.css";

export default ((): void => {
  ReactDOM.render(
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
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
