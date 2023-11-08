import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { ColorMode, getTheme } from "@namada/utils";
import { AppContainer, BottomSection, GlobalStyles } from "App/App.components";
import { Route, Routes } from "react-router-dom";
import { Main } from "./Main";
import { Heading, HeadingLevel } from "@namada/components";
import { GithubEligible } from "./GithubEligible";
import { AirdropConfirmation } from "./AirdropConfirmation";

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const theme = getTheme(colorMode);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      <AppContainer>
        <Routes>
          <Route path={`/`} element={<Main />} />
          <Route path={`/eligible-with-github`} element={<GithubEligible />} />
          <Route
            path={`/airdrop-confirmed`}
            element={<AirdropConfirmation />}
          />
        </Routes>
        <BottomSection />
      </AppContainer>
    </ThemeProvider>
  );
};
