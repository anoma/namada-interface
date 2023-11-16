import React, { useState } from "react";
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { Container, LifecycleExecutionWrapper } from "@namada/components";
import { formatRouterPath, getTheme } from "@namada/utils";
import { AccountSecret } from "background/keyring";
import { AnimatePresence } from "framer-motion";
import { SeedPhrase, SeedPhraseConfirmation } from "./AccountCreation/Steps";
import { Completion, ContainerHeader } from "./Common";
import { SeedPhraseImport } from "./ImportAccount";
import { LedgerConfirmation, LedgerConnect, LedgerImport } from "./Ledger";
import { MotionContainer } from "./Setup.components";
import { Start } from "./Start";

import { useCloseTabOnExtensionLock } from "hooks/useCloseTabOnExtensionLock";
import { usePasswordInitialized } from "hooks/usePasswordInitialized";
import { SeedPhraseWarning } from "./AccountCreation/Steps/SeedPhraseWarning";
import { SeedPhraseSetup } from "./ImportAccount";
import {
  AccountCreationRoute,
  AccountDetails,
  AccountImportRoute,
  LedgerConnectRoute,
  TopLevelRoute,
} from "./types";

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
  useCloseTabOnExtensionLock();

  const passwordInitialized = usePasswordInitialized();
  const theme = getTheme("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const [accountCreationDetails, setAccountCreationDetails] =
    useState<AccountDetails>({
      alias: "",
    });
  const [accountSecret, setAccountSecret] = useState<AccountSecret>();
  const [selectedAccountSecret, setSelectedAccountSecret] = useState<AccountSecret>();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const seedPhrase = accountSecret?.t === "Mnemonic"
    ? accountSecret.seedPhrase
    : undefined;

  const goToStep = (step: number) => () => setCurrentStep(step);

  return (
    <ThemeProvider theme={theme}>
      <Container
        size="md"
        header={
          <ContainerHeader currentStep={currentStep} totalSteps={totalSteps} />
        }
      >
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
                        accountCreationDetails={accountCreationDetails}
                        defaultSeedPhrase={seedPhrase}
                        onConfirm={(seedPhrase: string[]) => {
                          setAccountSecret({ t: "Mnemonic", seedPhrase });
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
                        passwordRequired={!passwordInitialized}
                        onConfirm={(accountCreationDetails: AccountDetails) => {
                          if (!seedPhrase?.length) {
                            navigate(
                              formatRouterPath([
                                TopLevelRoute.AccountCreation,
                                AccountCreationRoute.SeedPhraseConfirmation,
                              ])
                            );
                            return;
                          }
                          setAccountCreationDetails(accountCreationDetails);
                          setSelectedAccountSecret({ t: "Mnemonic", seedPhrase });
                          setAccountSecret(undefined); // this also sets seedPhrase to undefined
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
                        passwordRequired={!passwordInitialized}
                        pageTitle="Namada Keys Created"
                        pageSubtitle="Here are the accounts generated from your keys"
                        alias={accountCreationDetails.alias || ""}
                        accountSecret={selectedAccountSecret}
                        password={accountCreationDetails.password || ""}
//                       scanAccounts={false}
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
                        onConfirm={(accountSecret: AccountSecret) => {
                          setAccountSecret(accountSecret);
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
                        passwordRequired={!passwordInitialized}
                        accountCreationDetails={accountCreationDetails}
                        accountSecret={accountSecret}
                        onConfirm={(accountCreationDetails: AccountDetails) => {
                          if (!accountSecret) {
                            navigate(
                              formatRouterPath([
                                TopLevelRoute.ImportAccount,
                                AccountImportRoute.SeedPhrase,
                              ])
                            );
                            return;
                          }

                          setSelectedAccountSecret(accountSecret);
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
                        passwordRequired={!passwordInitialized}
                        pageTitle="Namada Keys Imported"
                        pageSubtitle="Here are the accounts generated from your keys"
                        alias={accountCreationDetails.alias || ""}
                        accountSecret={selectedAccountSecret}
                        password={accountCreationDetails.password || ""}
//                         scanAccounts={false}
                      />
                    </LifecycleExecutionWrapper>
                  }
                />
              </Route>

              {/* Connect to Ledger */}
              <Route
                path={`/${TopLevelRoute.Ledger}`}
                element={
                  <LifecycleExecutionWrapper onLoad={() => setTotalSteps(3)}>
                    <Outlet />
                  </LifecycleExecutionWrapper>
                }
              >
                <Route
                  path={`${LedgerConnectRoute.Connect}`}
                  element={
                    <LifecycleExecutionWrapper onLoad={() => setCurrentStep(1)}>
                      <LedgerConnect />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={`${LedgerConnectRoute.Import}`}
                  element={
                    <LifecycleExecutionWrapper onLoad={() => setCurrentStep(2)}>
                      <LedgerImport passwordRequired={!passwordInitialized} />
                    </LifecycleExecutionWrapper>
                  }
                />
                <Route
                  path={`${LedgerConnectRoute.Completion}`}
                  element={
                    <LifecycleExecutionWrapper onLoad={() => setCurrentStep(3)}>
                      <LedgerConfirmation />
                    </LifecycleExecutionWrapper>
                  }
                />
              </Route>
            </Routes>
          </AnimatedTransition>
        </AnimatePresence>
      </Container>
    </ThemeProvider>
  );
};
