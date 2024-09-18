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

const { NAMADA_INTERFACE_PROXY: isProxy = "false" } = process.env;

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
  const swConfig: Record<string, string> = {
    isProxy: isProxy,
  };
  const swUrl = `/sw/sw.js?${new URLSearchParams(swConfig).toString()}`;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(swUrl, {
        scope: "/sw/",
      })
      .then((registration) => {
        console.log("Service Worker registered: ", registration);

        const msgChannel = new MessageChannel();
        registration.active?.postMessage(
          {
            type: "INIT_PORT",
          },
          [msgChannel.port2]
        );

        msgChannel.port1.onmessage = (event) => {
          switch (event.type) {
            case "namadillo:hasMaspParamsResponse":
              console.warn(`${event.data.param}: ${event.data.hasMaspParam}`);
              break;
          }
        };

        registration.active?.postMessage({
          type: "namadillo:hasMaspParams",
          param: "masp-output.params",
        });
        registration.active?.postMessage({
          type: "namadillo:hasMaspParams",
          param: "masp-spend.params",
        });
        registration.active?.postMessage({
          type: "namadillo:hasMaspParams",
          param: "masp-convert.params",
        });
      })
      .catch((error) => {
        console.warn("Service Worker registration failed: ", error);
      });
  });
}
