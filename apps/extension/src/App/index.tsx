import React from "react";
import ReactDOM from "react-dom";
import { getTheme } from "@namada/utils";
import { AccountContextWrapper, VaultContextWrapper } from "context";
import { HashRouter } from "react-router-dom";
import { RequesterProvider } from "services";
import { ThemeProvider } from "styled-components";
import { App } from "./App";
import { GlobalStyle } from "./Common/GlobalStyles";

export default ((): void => {
  const theme = getTheme("dark");

  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <RequesterProvider>
          <VaultContextWrapper>
            <AccountContextWrapper>
              <ThemeProvider theme={theme}>
                <GlobalStyle />
                <App />
              </ThemeProvider>
            </AccountContextWrapper>
          </VaultContextWrapper>
        </RequesterProvider>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
