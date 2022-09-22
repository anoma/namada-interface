import React from "react";
import { ThemeProvider } from "styled-components";

import { Button, ButtonVariant } from "@anoma/components";
import { getTheme } from "@anoma/utils";

import browser from "webextension-polyfill";
import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "./App.components";

export const App: React.FC = () => {
  const theme = getTheme(true, false);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <TopSection>
          <h1>Anoma Browser Extension</h1>
        </TopSection>
        <ContentContainer>
          {/* Show user button to launch setup if this wallet hasn't been configured */}
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              browser.tabs.create({
                url: browser.runtime.getURL("setup.html"),
              });
            }}
          >
            Launch Initial Set-Up
          </Button>
          {/* Otherwise, load their accounts and display below */}
        </ContentContainer>
        <BottomSection></BottomSection>
      </AppContainer>
    </ThemeProvider>
  );
};
