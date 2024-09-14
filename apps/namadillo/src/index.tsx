import { init as initShared } from "@namada/shared/src/init-inline";
import { QueryProvider } from "App/Common/QueryProvider";
import { SdkProvider } from "hooks/useSdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { getRouter } from "./App/AppRoutes";
import { IntegrationsProvider } from "./services";

import "@namada/components/src/base.css";
import "@namada/utils/bigint-to-json-polyfill";
import { ExtensionLoader } from "App/Setup/ExtensionLoader";
import { IndexerLoader } from "App/Setup/IndexerLoader";
import { TomlConfigLoader } from "App/Setup/TomlConfigLoader";
import "./tailwind.css";

const router = getRouter();

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  initShared().then(() => {
    root.render(
      <React.StrictMode>
        <QueryProvider>
          <IntegrationsProvider>
            <TomlConfigLoader>
              <IndexerLoader>
                <ExtensionLoader>
                  <SdkProvider>
                    <RouterProvider router={router} />
                  </SdkProvider>
                </ExtensionLoader>
              </IndexerLoader>
            </TomlConfigLoader>
          </IntegrationsProvider>
        </QueryProvider>
      </React.StrictMode>
    );
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw/sw.js", { scope: "/sw/" })
      .then((registration) => {
        console.log("Service Worker registered: ", registration);
      })
      .catch((error) => {
        console.log("Service Worker registration failed: ", error);
      });
  });
}
