import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { Approvals } from "./Approvals";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <Approvals />
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
