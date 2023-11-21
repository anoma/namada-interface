import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import { getTheme } from "@namada/utils";
import { RequesterProvider } from "services";
import { Approvals } from "./Approvals";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "App/Common/GlobalStyles";

export default ((): void => {
  const theme = getTheme("dark");
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <ThemeProvider theme={theme}>
            <GlobalStyle />

            <Approvals />
          </ThemeProvider>
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
