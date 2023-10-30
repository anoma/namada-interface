import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { formatRouterPath, getTheme } from "@namada/utils";
import {
  Container,
  Image,
  ImageName,
  LifecycleExecutionWrapper,
  ProgressIndicator,
} from "@namada/components";

import { AnimatePresence } from "framer-motion";
import { useRequester } from "hooks/useRequester";
import { SeedPhrase, SeedPhraseConfirmation } from "./AccountCreation/Steps";
import { Completion } from "./Common";
import { SeedPhraseImport } from "./ImportAccount";
import { Ledger } from "./Ledger";
import { LogoContainer, MotionContainer } from "./Setup.components";
import { Start } from "./Start";

import LedgerConfirmation from "./Ledger/LedgerConfirmation";

import {
  AccountCreationRoute,
  AccountDetails,
  AccountImportRoute,
  TopLevelRoute,
} from "./types";
import { SeedPhraseWarning } from "./AccountCreation/Steps/SeedPhraseWarning";
import SeedPhraseSetup from "./ImportAccount/Steps/SeedPhraseSetup/SeedPhraseSetup";

type AnimatedTransitionProps = {
  elementKey: string;
  children: JSX.Element;
};

/**
 * This is a utility to animate transitions
 */
const AnimatedTransition: React.FC<AnimatedTransitionProps> = (props) => {
  const { children, elementKey } = props;
  return (
    <MotionContainer
      key={elementKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </MotionContainer>
  );
};

export const Setup: React.FC = () => {
  const requester = useRequester();
  const theme = getTheme("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const [accountCreationDetails, setAccountCreationDetails] =
    useState<AccountDetails>({
      alias: "",
    });
  const [seedPhrase, setSeedPhrase] = useState<string[]>();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const containerHeader = (
    <>
      {totalSteps === 0 && (
        <LogoContainer>
          <Image imageName={ImageName.Logo} />
        </LogoContainer>
      )}
      {totalSteps > 0 && (
        <ProgressIndicator
          keyName="test"
          totalSteps={totalSteps}
          currentStep={currentStep}
        />
      )}
    </>
  );

  const goToStep = (step: number) => () => setCurrentStep(step);

  return (
    <ThemeProvider theme={theme}>
      <Container size="md" header={containerHeader}>
        <AnimatePresence>
          <AnimatedTransition elementKey={location.pathname}>
            <Routes>
              {/* Index */}
              <Route
                path={formatRouterPath([TopLevelRoute.Start])}
                element={
                  <LifecycleExecutionWrapper onLoad={() => setTotalSteps(0)}>
                    <Start />
                  </LifecycleExecutionWrapper>
                }
              />

              {/* Create New Keys */}
              <Route
                path={`/${TopLevelRoute.AccountCreation}`}
                element={
                  <LifecycleExecutionWrapper onLoad={() => setTotalSteps(4)}>
                    <Outlet />
                  </LifecycleExecutionWrapper>
                }
              >
                <Route
                  path={AccountCreationRoute.SeedPhraseWarning}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(1)}>
                      <SeedPhraseWarning
                        onComplete={() => {
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.AccountCreation,
                              AccountCreationRoute.SeedPhrase,
                            ])
                          );
                        }}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={AccountCreationRoute.SeedPhrase}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(2)}>
                      <SeedPhrase
                        requester={requester}
                        accountCreationDetails={accountCreationDetails}
                        defaultSeedPhrase={seedPhrase}
                        onConfirm={(seedPhrase: string[]) => {
                          setSeedPhrase(seedPhrase);
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.AccountCreation,
                              AccountCreationRoute.SeedPhraseConfirmation,
                            ])
                          );
                        }}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={AccountCreationRoute.SeedPhraseConfirmation}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(3)}>
                      <SeedPhraseConfirmation
                        accountCreationDetails={accountCreationDetails}
                        seedPhrase={seedPhrase || []}
                        onConfirm={(accountCreationDetails: AccountDetails) => {
                          setAccountCreationDetails(accountCreationDetails);
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.AccountCreation,
                              AccountCreationRoute.Completion,
                            ])
                          );
                        }}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={AccountCreationRoute.Completion}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(4)}>
                      <Completion
                        pageTitle="Namada Keys Created"
                        pageSubtitle="Here are the accounts generated from your keys"
                        alias={accountCreationDetails.alias || ""}
                        requester={requester}
                        mnemonic={seedPhrase || []}
                        password={accountCreationDetails.password || ""}
                        scanAccounts={false}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
              </Route>

              {/* Import Existing Keys */}
              <Route
                path={`/${TopLevelRoute.ImportAccount}`}
                element={
                  <LifecycleExecutionWrapper onLoad={() => setTotalSteps(3)}>
                    <Outlet />
                  </LifecycleExecutionWrapper>
                }
              >
                <Route
                  path={AccountImportRoute.SeedPhrase}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(1)}>
                      <SeedPhraseImport
                        requester={requester}
                        onConfirm={(seedPhrase: string[]) => {
                          setSeedPhrase(seedPhrase);
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.ImportAccount,
                              AccountImportRoute.Password,
                            ])
                          );
                        }}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={AccountImportRoute.Password}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(2)}>
                      <SeedPhraseSetup
                        accountCreationDetails={accountCreationDetails}
                        seedPhrase={seedPhrase}
                        onConfirm={(accountCreationDetails: AccountDetails) => {
                          setAccountCreationDetails(accountCreationDetails);
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.ImportAccount,
                              AccountImportRoute.Completion,
                            ])
                          );
                        }}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={AccountImportRoute.Completion}
                  element={
                    <LifecycleExecutionWrapper onLoad={goToStep(3)}>
                      <Completion
                        pageTitle="Namada Keys Imported"
                        pageSubtitle="Here are the accounts generated from your keys"
                        alias={accountCreationDetails.alias || ""}
                        requester={requester}
                        mnemonic={seedPhrase || []}
                        password={accountCreationDetails.password || ""}
                        scanAccounts={false}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
              </Route>

              {/* Connect to Ledger */}
              <Route path={`/${TopLevelRoute.Ledger}`} element={<Ledger />} />

              {/* Ledger Connected */}
              <Route
                path={`/${TopLevelRoute.LedgerConfirmation}/:alias/:address/:publicKey`}
                element={<LedgerConfirmation />}
              />
            </Routes>
          </AnimatedTransition>
        </AnimatePresence>
      </Container>
    </ThemeProvider>
  );
};
