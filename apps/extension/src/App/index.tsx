import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { App } from "./App";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <App />
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
