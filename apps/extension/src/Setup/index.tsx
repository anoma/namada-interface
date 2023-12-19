import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { Setup } from "./Setup";

import "@namada/components/src/base.css";
import "../tailwind.css";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <Setup />
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
