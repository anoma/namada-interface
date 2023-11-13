import { useAtom } from "jotai";
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { ColorMode, getTheme } from "@namada/utils";
import {
  AppContainer,
  AppContainerHeader,
  GlobalStyles,
  Logo,
} from "App/App.components";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Main } from "./Main";
import { AirdropConfirmation } from "./AirdropConfirmation";
import {
  Button,
  ButtonVariant,
  ImageName,
  Image,
  LinkButton,
} from "@namada/components";
import { NonEligible } from "./NonEligible";
import { confirmationAtom, claimAtom } from "./state";
import { ClaimConfirmation } from "./Claim/ClaimConfirmation";
import { ClaimInfo } from "./Claim/ClaimInfo";
import { Claim } from "./Claim";
import { TrustedSetup } from "./TrustedSetup";

export const App: React.FC = () => {
  const initialColorMode = "light";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [claimState] = useAtom(claimAtom);
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
            style={isRoot ? { display: "none" } : {}}
            variant={ButtonVariant.Small}
            onClick={() => {
              navigate("/");
            }}
          >
            Start over
          </Button>
          <Logo>
            <Image
              imageName={ImageName.Logo}
              styleOverrides={{ width: "240px" }}
              forceLightMode={true}
            />
          </Logo>
          <LinkButton themeColor="utility2">Terms of service</LinkButton>
        </AppContainerHeader>
        <Routes>
          <Route path={`/`} element={<Main />} />
          <Route
            path={`/claim`}
            element={
              !!claimState ? (
                <Claim></Claim>
              ) : (
                <Navigate to="/" replace={true} />
              )
            }
          >
            <Route path={`info`} element={<ClaimInfo />} />
            <Route path={`confirmation`} element={<ClaimConfirmation />} />
          </Route>
          <Route path={`/trusted-setup`} element={<TrustedSetup />} />
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
