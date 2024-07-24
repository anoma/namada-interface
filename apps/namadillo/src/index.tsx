import { init as initShared } from "@namada/shared/src/init-inline";
import { AppSetup } from "App/AppSetup";
import { StoreProvider } from "atoms/store";
import { SdkProvider } from "hooks/useSdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { getRouter } from "./App/AppRoutes";
import { IntegrationsProvider } from "./services";

import "@namada/components/src/base.css";
import "@namada/utils/bigint-to-json-polyfill";
import "./tailwind.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  initShared().then(() => {
    root.render(
      <React.StrictMode>
        <StoreProvider>
          <IntegrationsProvider>
            <AppSetup>
              <SdkProvider>
                <RouterProvider router={getRouter()} />
              </SdkProvider>
            </AppSetup>
          </IntegrationsProvider>
        </StoreProvider>
      </React.StrictMode>
    );
  });
}
