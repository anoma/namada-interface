import init from "@namada/sdk/inline-init";
import { QueryProvider } from "App/Common/QueryProvider";
import { SdkProvider } from "hooks/useSdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { getRouter } from "./App/AppRoutes";

import "@namada/components/src/base.css";
import "@namada/utils/bigint-to-json-polyfill";
import { StorageProvider } from "App/Common/StorageProvider";
import { ExtensionLoader } from "App/Setup/ExtensionLoader";
import { IndexerLoader } from "App/Setup/IndexerLoader";
import { TomlConfigLoader } from "App/Setup/TomlConfigLoader";
import "./tailwind.css";

const router = getRouter();

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  init().then(() => {
    root.render(
      <React.StrictMode>
        <QueryProvider>
          <StorageProvider>
            <TomlConfigLoader>
              <IndexerLoader>
                <ExtensionLoader>
                  <SdkProvider>
                    <RouterProvider router={router} />
                  </SdkProvider>
                </ExtensionLoader>
              </IndexerLoader>
            </TomlConfigLoader>
          </StorageProvider>
        </QueryProvider>
      </React.StrictMode>
    );
  });
}
