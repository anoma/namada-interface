import { useAtom } from "jotai";
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { ColorMode, getTheme } from "@namada/utils";
import {
  AppContainer,
  AppContainerHeader,
  GlobalStyles,
} from "App/App.components";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Main } from "./Main";
import { GithubEligible } from "./GithubEligible";
import { AirdropConfirmation } from "./AirdropConfirmation";
import { Button, ButtonVariant } from "@namada/components";
import { TSEligibility } from "./TSEligibility";
import { NonEligible } from "./NonEligible";
import { confirmationAtom, githubAtom } from "./state";

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [eligibilityState] = useAtom(githubAtom);
  const [confirmationState] = useAtom(confirmationAtom);
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
          <Route
            path={`/eligible-with-github`}
            element={
              !!eligibilityState ? (
                <GithubEligible />
              ) : (
                <Navigate to="/" replace={true} />
              )
            }
          />
          <Route path={`/check-ts-eligibility`} element={<TSEligibility />} />
          <Route
            path={`/airdrop-confirmed`}
            element={
              !!confirmationState ? (
                <AirdropConfirmation />
              ) : (
                <Navigate to="/" replace={true} />
              )
            }
          />

          <Route path={`/non-eligible`} element={<NonEligible />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </AppContainer>
    </ThemeProvider>
  );
};
