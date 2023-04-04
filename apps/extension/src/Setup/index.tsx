import { RequesterProvider } from "App/Requester";
import React from "react";
import ReactDOM from "react-dom";

import { Setup } from "./Setup";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <RequesterProvider>
        <Setup />
      </RequesterProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
