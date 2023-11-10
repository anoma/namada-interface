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
import { AirdropConfirmation } from "./AirdropConfirmation";
import { Button, ButtonVariant } from "@namada/components";
import { TSEligibility } from "./TSEligibility";
import { NonEligible } from "./NonEligible";
import { confirmationAtom, githubAtom } from "./state";
import { ClaimConfirmation } from "./Claim/ClaimConfirmation";
import { ClaimInfo } from "./Claim/ClaimInfo";
import { Claim } from "./Claim";

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
            path={`/claim`}
            element={
              !!eligibilityState ? (
                <Claim></Claim>
              ) : (
                <Navigate to="/" replace={true} />
              )
            }
          >
            <Route path={`info`} element={<ClaimInfo />} />
            <Route path={`confirmation`} element={<ClaimConfirmation />} />
          </Route>
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
        </Routes>
      </AppContainer>
    </ThemeProvider>
  );
};
