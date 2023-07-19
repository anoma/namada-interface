import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { formatRouterPath, getTheme } from "@namada/utils";

import { AccountCreation } from "./AccountCreation";
import {
  AppContainer,
  ContentContainer,
  GlobalStyles,
  MotionContainer,
} from "./Setup.components";
import {
  SeedPhrase,
  SeedPhraseConfirmation,
} from "Setup/AccountCreation/Steps";
import {
  TopLevelRoute,
  AccountCreationRoute,
  AccountDetails,
  AccountImportRoute,
} from "./types";
import { Ledger } from "./Ledger";
import { Start } from "./Start";
import { AnimatePresence } from "framer-motion";
import { ImportAccount } from "./ImportAccount";
import { useRequester } from "hooks/useRequester";
import { SeedPhraseImport } from "./ImportAccount/Steps";
import { Completion, Password } from "./Common";

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
  const [accountCreationDetails, setAccountCreationDetails] =
    useState<AccountDetails>({
      alias: "",
    });
  const [seedPhrase, setSeedPhrase] = useState<string[]>();

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <ContentContainer>
          <AnimatePresence>
            <Routes>
              <Route
                path={formatRouterPath([TopLevelRoute.Start])}
                element={<Start />}
              />
              <Route
                path={`/${TopLevelRoute.AccountCreation}`}
                element={
                  <AnimatedTransition
                    elementKey={TopLevelRoute.AccountCreation}
                  >
                    <AccountCreation />
                  </AnimatedTransition>
                }
              >
                <Route
                  path={AccountCreationRoute.SeedPhrase}
                  element={
                    <AnimatedTransition
                      elementKey={AccountCreationRoute.SeedPhrase}
                    >
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
                    </AnimatedTransition>
                  }
                />
                <Route
                  path={AccountCreationRoute.SeedPhraseConfirmation}
                  element={
                    <AnimatedTransition
                      elementKey={AccountCreationRoute.SeedPhraseConfirmation}
                    >
                      <SeedPhraseConfirmation
                        seedPhrase={seedPhrase || []}
                        onConfirm={() =>
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.AccountCreation,
                              AccountCreationRoute.Password,
                            ])
                          )
                        }
                      />
                    </AnimatedTransition>
                  }
                />
                <Route
                  path={AccountCreationRoute.Password}
                  element={
                    <AnimatedTransition
                      elementKey={AccountCreationRoute.Password}
                    >
                      <Password
                        accountCreationDetails={accountCreationDetails}
                        onSetAccountCreationDetails={(
                          accountCreationDetailsDelta
                        ) => {
                          setAccountCreationDetails(
                            (accountCreationDetails) => {
                              return {
                                ...accountCreationDetails,
                                ...accountCreationDetailsDelta,
                              };
                            }
                          );
                        }}
                        onSubmitAccountCreationDetails={(
                          accountCreationDetails
                        ) => {
                          setAccountCreationDetails(accountCreationDetails);
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.AccountCreation,
                              AccountCreationRoute.Completion,
                            ])
                          );
                        }}
                      />
                    </AnimatedTransition>
                  }
                />
                <Route
                  path={AccountCreationRoute.Completion}
                  element={
                    <AnimatedTransition
                      elementKey={AccountCreationRoute.Completion}
                    >
                      <Completion
                        alias={accountCreationDetails.alias || ""}
                        requester={requester}
                        mnemonic={seedPhrase || []}
                        password={accountCreationDetails.password || ""}
                        scanAccounts={false}
                      />
                    </AnimatedTransition>
                  }
                />
              </Route>
              <Route
                path={`/${TopLevelRoute.ImportAccount}`}
                element={<ImportAccount />}
              >
                <Route
                  path={AccountImportRoute.SeedPhrase}
                  element={
                    <AnimatedTransition
                      elementKey={AccountImportRoute.SeedPhrase}
                    >
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
                    </AnimatedTransition>
                  }
                />

                <Route
                  path={AccountImportRoute.Password}
                  element={
                    <AnimatedTransition
                      elementKey={AccountImportRoute.Password}
                    >
                      <Password
                        accountCreationDetails={accountCreationDetails}
                        onSetAccountCreationDetails={(
                          accountCreationDetailsDelta
                        ) => {
                          setAccountCreationDetails(
                            (accountCreationDetails) => {
                              return {
                                ...accountCreationDetails,
                                ...accountCreationDetailsDelta,
                              };
                            }
                          );
                        }}
                        onSubmitAccountCreationDetails={(
                          accountCreationDetails
                        ) => {
                          setAccountCreationDetails(accountCreationDetails);
                          navigate(
                            formatRouterPath([
                              TopLevelRoute.ImportAccount,
                              AccountImportRoute.Completion,
                            ])
                          );
                        }}
                      />
                    </AnimatedTransition>
                  }
                />
                <Route
                  path={AccountImportRoute.Completion}
                  element={
                    <AnimatedTransition
                      elementKey={AccountImportRoute.Completion}
                    >
                      <Completion
                        alias={accountCreationDetails.alias || ""}
                        requester={requester}
                        mnemonic={seedPhrase || []}
                        password={accountCreationDetails.password || ""}
                        scanAccounts={true}
                      />
                    </AnimatedTransition>
                  }
                />
              </Route>
              <Route
                path={`/${TopLevelRoute.Ledger}`}
                element={
                  <AnimatedTransition elementKey={TopLevelRoute.Ledger}>
                    <Ledger requester={requester} />
                  </AnimatedTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </ContentContainer>
      </AppContainer>
    </ThemeProvider>
  );
};
