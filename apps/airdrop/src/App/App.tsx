import { useAtom } from "jotai";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { ColorMode, getTheme } from "@namada/utils";
import {
  AppContainer,
  AppContainerHeader,
  GlobalStyles,
} from "App/App.components";
import { Route, Routes, useNavigate, Outlet } from "react-router-dom";
import { Main } from "./Main";
import { GithubEligible } from "./GithubEligible";
import { AirdropConfirmation } from "./AirdropConfirmation";
import { Button, ButtonVariant } from "@namada/components";
import { TSEligibility } from "./TSEligibility";
import { NonEligible } from "./NonEligible";
import { confirmationAtom, githubAtom } from "./state";

type GuardedRouteProps = {
  canAccess: boolean;
  redirect?: string;
};

const GuardedRoute: React.FC<GuardedRouteProps> = ({
  canAccess,
  redirect = "/",
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!canAccess) {
      navigate(redirect, { replace: true });
    }
  });

  return <Outlet />;
};

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
          <Route element={<GuardedRoute canAccess={!!eligibilityState} />}>
            <Route
              path={`/eligible-with-github`}
              element={<GithubEligible />}
            />
          </Route>
          <Route element={<GuardedRoute canAccess={!!eligibilityState} />}>
            <Route path={`/check-ts-eligibility`} element={<TSEligibility />} />
          </Route>
          <Route element={<GuardedRoute canAccess={!!confirmationState} />}>
            <Route
              path={`/airdrop-confirmed`}
              element={<AirdropConfirmation />}
            />
          </Route>

          <Route path={`/non-eligible`} element={<NonEligible />} />
        </Routes>
      </AppContainer>
    </ThemeProvider>
  );
};
