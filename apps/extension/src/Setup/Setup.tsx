import browser from "webextension-polyfill";
import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { formatRouterPath, getTheme } from "@anoma/utils";
import { ExtensionKVStore } from "@anoma/storage";

import { ExtensionMessenger, ExtensionRequester } from "extension";
import { AccountCreation } from "./AccountCreation";
import {
  AppContainer,
  ContentContainer,
  GlobalStyles,
  MotionContainer,
  TopSection,
} from "./Setup.components";
import {
  Completion,
  SeedPhrase,
  SeedPhraseConfirmation,
  Password,
} from "Setup/AccountCreation/Steps";
import { KVPrefix } from "router";
import { TopLevelRoute, AccountCreationRoute, AccountDetails } from "./types";
import { Ledger } from "./Ledger";
import { Start } from "./Start";
import { AnimatePresence } from "framer-motion";
import { ImportAccount } from "./ImportAccount";

const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();
const requester = new ExtensionRequester(messenger, store);

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
        <TopSection>Anoma Browser Extension</TopSection>
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
                      />
                    </AnimatedTransition>
                  }
                />
              </Route>
              <Route
                path={`/${TopLevelRoute.ImportAccount}`}
                element={<ImportAccount />}
              />
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
