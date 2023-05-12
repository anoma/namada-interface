import browser from "webextension-polyfill";
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { getTheme } from "@anoma/utils";
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
import { KVPrefix } from "router";
import { TopLevelRoute } from "./types";
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

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <GlobalStyles />
        <TopSection>Anoma Browser Extension</TopSection>
        <ContentContainer>
          <AnimatePresence>
            <HashRouter>
              <Routes>
                <Route path={TopLevelRoute.Start} element={<Start />} />
                <Route
                  path={TopLevelRoute.AccountCreation}
                  element={
                    <AnimatedTransition
                      elementKey={TopLevelRoute.AccountCreation}
                    >
                      <AccountCreation requester={requester} />
                    </AnimatedTransition>
                  }
                />
                <Route
                  path={TopLevelRoute.ImportAccount}
                  element={<ImportAccount />}
                />
                <Route
                  path={TopLevelRoute.Ledger}
                  element={
                    <AnimatedTransition elementKey={TopLevelRoute.Ledger}>
                      <Ledger requester={requester} />
                    </AnimatedTransition>
                  }
                />
              </Routes>
            </HashRouter>
          </AnimatePresence>
        </ContentContainer>
      </AppContainer>
    </ThemeProvider>
  );
};
