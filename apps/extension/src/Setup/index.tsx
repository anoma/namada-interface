import React from "react";
import ReactDOM from "react-dom";

import { Setup } from "./Setup";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <Setup />
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
