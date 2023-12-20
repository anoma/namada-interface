import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { getTheme } from "@namada/utils";
import { RequesterProvider } from "services";
import { ThemeProvider } from "styled-components";
import { Approvals } from "./Approvals";

import "../global.css";

export default ((): void => {
  const theme = getTheme("dark");
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <ThemeProvider theme={theme}>
            <Approvals />
          </ThemeProvider>
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
