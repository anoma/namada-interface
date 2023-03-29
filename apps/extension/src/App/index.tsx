import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import { RequesterProvider } from "./Requester";

export default ((): void => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <RequesterProvider>
          <App />
        </RequesterProvider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
