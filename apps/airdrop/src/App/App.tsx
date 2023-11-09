import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { ColorMode, getTheme } from "@namada/utils";
import {
  AppContainer,
  AppContainerHeader,
  GlobalStyles,
} from "App/App.components";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Main } from "./Main";
import { GithubEligible } from "./GithubEligible";
import { AirdropConfirmation } from "./AirdropConfirmation";
import { Button, ButtonVariant } from "@namada/components";
import { TSEligibility } from "./TSEligibility";

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const theme = getTheme(colorMode);
  const navigate = useNavigate();
  const isRoot = window.location.pathname === "/";

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      <AppContainer>
        <AppContainerHeader>
          <Button
            style={isRoot ? { visibility: "hidden" } : {}}
            variant={ButtonVariant.Small}
            onClick={() => {
              navigate("/");
            }}
          >
            Start over
          </Button>
        </AppContainerHeader>
        <Routes>
          <Route path={`/`} element={<Main />} />
          <Route path={`/eligible-with-github`} element={<GithubEligible />} />
          <Route path={`/check-ts-eligibility`} element={<TSEligibility />} />
          <Route
            path={`/airdrop-confirmed`}
            element={<AirdropConfirmation />}
          />
        </Routes>
      </AppContainer>
    </ThemeProvider>
  );
};
