import React, { useState } from "react";
import { ThemeProvider } from "styled-components";

import { ColorMode, getTheme } from "@namada/utils";
import { Heading, HeadingLevel, } from "@namada/components";

import {
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "App/App.components";
import { FaucetForm } from "App/Faucet";

export const App: React.FC = () => {
  const initialColorMode = "dark"
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const theme = getTheme(colorMode);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      <AppContainer>
        <TopSection>
          <Heading level={HeadingLevel.One}>Namada Faucet</Heading>
        </TopSection>
        <ContentContainer>
          <FaucetForm />
        </ContentContainer>
        <BottomSection />
      </AppContainer>
    </ThemeProvider>
  );
};
