import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { getTheme } from "@anoma/utils";
import { ExtensionRequester } from "extension";

import { AccountCreation } from "./AccountCreation";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "./Setup.components";

const requester = new ExtensionRequester();

export const Setup: React.FC = () => {
  const theme = getTheme(true, false);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <TopSection>Anoma Browser Extension</TopSection>
        <ContentContainer>
          <BrowserRouter>
            <Routes>
              <Route
                path={`*`}
                element={<AccountCreation requester={requester} />}
              />
            </Routes>
          </BrowserRouter>
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
