import { init as initShared } from "@namada/shared/src/init-inline";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ExtensionEventsProvider, IntegrationsProvider } from "services";
import { store } from "store/store";
import { getRouter } from "./App/AppRoutes";
import reportWebVitals from "./reportWebVitals";

import "@namada/components/src/base.css";
import "./tailwind.css";

ReactDOM.render(
  <React.StrictMode>
    <IntegrationsProvider>
      <Provider store={store}>
        <ExtensionEventsProvider>
          <RouterProvider router={getRouter()} />
        </ExtensionEventsProvider>
      </Provider>
    </IntegrationsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
initShared();
