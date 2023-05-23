import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { Setup } from "./Setup";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <Setup />
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
