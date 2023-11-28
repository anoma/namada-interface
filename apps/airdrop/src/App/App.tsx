import {
  Button,
  ButtonVariant,
  Image,
  ImageName,
  LinkButton,
} from "@namada/components";
import { getTheme } from "@namada/utils";
import { AppContainerHeader, GlobalStyles, Logo } from "App/App.components";
import { useAtom } from "jotai";
import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AirdropConfirmation } from "./AirdropConfirmation";
import { Claim } from "./Claim";
import { ClaimConfirmation } from "./Claim/ClaimConfirmation";
import { ClaimInfo } from "./Claim/ClaimInfo";
import { Main } from "./Main";
import { NonEligible } from "./NonEligible";
import { TrustedSetup } from "./TrustedSetup";
import { claimAtom, confirmationAtom } from "./state";
import { BrowserView, MobileView } from "react-device-detect";
import { MainMobile } from "./MainMobile";

export const App: React.FC = () => {
  const [claimState, setClaimState] = useAtom(claimAtom);
  const [confirmationState, setConfirmationState] = useAtom(confirmationAtom);
  const theme = getTheme("dark");
  const navigate = useNavigate();
  const { pathname } = window.location;

  const showStartOver = pathname !== "/";

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode="dark" />
      <BrowserView>
        <AppContainerHeader>
          <Button
            style={showStartOver ? {} : { display: "none" }}
            variant={ButtonVariant.Small}
            onClick={() => {
              navigate("/");
              setClaimState(null);
              setConfirmationState(null);
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
          <LinkButton underline={false} themeColor="utility1">
            Terms of service
          </LinkButton>
        </AppContainerHeader>
        <Routes>
          <Route path={`/`} element={<Main />} />
          <Route
            path={`/claim`}
            element={
              true || !!claimState ? (
                <Claim />
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
          <Route
            path={`/non-eligible`}
            element={
              true || !!claimState ? (
                <NonEligible />
              ) : (
                <Navigate to="/" replace={true} />
              )
            }
          />
        </Routes>
      </BrowserView>
      <MobileView>
        <GlobalStyles colorMode="light" />
        <MainMobile />
      </MobileView>
    </ThemeProvider>
  );
};
