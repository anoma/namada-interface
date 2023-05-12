import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { Setup } from "./Setup";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <Setup />
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
