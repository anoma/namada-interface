import { getTheme } from "@namada/utils";
import { GlobalStyles } from "App/App.components";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AirdropConfirmation } from "./AirdropConfirmation";
import { Claim } from "./Claim";
import { ClaimConfirmation } from "./Claim/ClaimConfirmation";
import { ClaimInfo } from "./Claim/ClaimInfo";
import { PageHeader } from "./Common/PageHeader";
import { Main } from "./Main";
import { NonEligible } from "./NonEligible";
import { TrustedSetup } from "./TrustedSetup";
import { claimAtom, confirmationAtom } from "./state";
import { BrowserView, MobileView } from "react-device-detect";
import { MainMobile } from "./MainMobile";
import { TermsOfService } from "./TermsOfService";

export const App: React.FC = () => {
  const [claimState] = useAtom(claimAtom);
  const [confirmationState] = useAtom(confirmationAtom);
  const theme = getTheme("dark");
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode="dark" />
      <BrowserView>
        <PageHeader
          showStartOver={pathname !== "/" && pathname !== "/terms-of-service"}
          showTermsOfService={pathname === "/"}
          showDomainWarning={pathname === "/"}
          showBackToClaim={pathname === "/terms-of-service"}
          yellowLogo={
            pathname !== "/" &&
            pathname !== "/claim-confirmed" &&
            pathname !== "/terms-of-service"
          }
        />
        <Routes>
          <Route path={`/`} element={<Main />} />
          <Route
            path={`/claim`}
            element={
              !!claimState ? <Claim /> : <Navigate to="/" replace={true} />
            }
          >
            <Route path={`eligible`} element={<ClaimInfo />} />
            <Route path={`confirmation`} element={<ClaimConfirmation />} />
          </Route>
          <Route path={`/trusted-setup`} element={<TrustedSetup />} />
          <Route
            path={`/claim-confirmed`}
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
              !!claimState ? (
                <NonEligible />
              ) : (
                <Navigate to="/" replace={true} />
              )
            }
          />
          <Route path={`/terms-of-service`} element={<TermsOfService />} />
        </Routes>
      </BrowserView>
      <MobileView>
        <GlobalStyles colorMode="light" />
        <MainMobile />
      </MobileView>
    </ThemeProvider>
  );
};
