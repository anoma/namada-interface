import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { App } from "./App";
import { RequesterProvider } from "./Requester";

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
