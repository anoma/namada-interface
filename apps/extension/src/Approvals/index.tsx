import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { RequesterProvider } from "App/Requester";
import { Approvals } from "./Approvals";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <Approvals />
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
