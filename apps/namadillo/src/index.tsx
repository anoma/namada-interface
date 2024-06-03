import { init as initShared } from "@namada/shared/src/init-inline";
import { SdkProvider } from "hooks/useSdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StoreProvider } from "store";
import { getRouter } from "./App/AppRoutes";
import reportWebVitals from "./reportWebVitals";
import { ExtensionEventsProvider, IntegrationsProvider } from "./services";

import "@namada/components/src/base.css";
import "./tailwind.css";

// TODO: we could show the loading screen while initShared is pending
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  initShared().then(() => {
    root.render(
      <React.StrictMode>
        <StoreProvider>
          <IntegrationsProvider>
            <SdkProvider>
              <ExtensionEventsProvider>
                <RouterProvider router={getRouter()} />
              </ExtensionEventsProvider>
            </SdkProvider>
          </IntegrationsProvider>
        </StoreProvider>
      </React.StrictMode>
    );
  });
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
