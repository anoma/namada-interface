import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { getTheme } from "@anoma/utils";
import { ExtensionRequester } from "extension";

import { AccountCreation } from "./AccountCreation";
// import { TopLevelRoute } from "./types";

const requester = new ExtensionRequester();

export const App: React.FC = () => {
  const theme = getTheme(false, false);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <h1>Anoma Browser Extension</h1>
        <BrowserRouter>
          <Routes>
            <Route
              path={`*`}
              element={<AccountCreation requester={requester} />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
};
