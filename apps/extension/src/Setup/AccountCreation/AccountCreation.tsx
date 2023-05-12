import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "styled-components";

import { ExtensionRequester } from "extension";
import { AccountCreationRoute, accountCreationSteps } from "./types";

import { Icon, IconName, IconSize } from "@anoma/components";
import {
  Password,
  SeedPhrase,
  SeedPhraseConfirmation,
  Completion,
} from "./Steps";
import {
  AccountCreationContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  RouteContainer,
  MotionContainer,
} from "./AccountCreation.components";
import { AccountDetails } from "Setup/AccountCreation/types";

type AnimatedTransitionProps = {
  elementKey: string;
  children: JSX.Element;
};

/**
 * This is a utility to facilitate the animated transitions.
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

type Props = {
  requester: ExtensionRequester;
};

/**
 * The main purpose of this is to coordinate the flow for creating a new account.
 * It persists the data between the screens in the flow.
 */
const AccountCreation: React.FC<Props> = ({ requester }) => {
  const [accountCreationDetails, setAccountCreationDetails] =
    useState<AccountDetails>({
      alias: "",
    });
  const [seedPhrase, setSeedPhrase] = useState<string[]>();
  const [stepIndex, setStepIndex] = useState(0);

  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  const location = useLocation();

  // info for disabling the back button in the last step
  const isLastIndex = accountCreationSteps.length - 1 === stepIndex;

  useEffect(() => {
    // at the load we redirect to the first step
    // this way we do not need to expose the flow routes to outside
    navigate(AccountCreationRoute.SeedPhrase);
  }, []);

  const navigateToNext = (): void => {
    setStepIndex((stepIndex) => stepIndex + 1);
    navigate(`${accountCreationSteps[stepIndex + 1]}`);
  };

  const navigateToPrevious = (): void => {
    setStepIndex((stepIndex) => {
      return stepIndex - 1;
    });
    navigate(`${accountCreationSteps[stepIndex - 1]}`);
  };

  return (
    <AccountCreationContainer>
      <TopSection>
        <TopSectionButtonContainer>
          {!isLastIndex && stepIndex !== 0 && (
            <a
              onClick={() => {
                navigateToPrevious();
              }}
              style={{ cursor: "pointer" }}
            >
              <Icon
                iconName={IconName.ChevronLeft}
                strokeColorOverride={themeContext.colors.utility2.main60}
                iconSize={IconSize.L}
              />
            </a>
          )}
        </TopSectionButtonContainer>
        <TopSectionHeaderContainer></TopSectionHeaderContainer>
        <TopSectionButtonContainer></TopSectionButtonContainer>
      </TopSection>
      <RouteContainer>
        <AnimatePresence exitBeforeEnter>
          <Routes location={location} key={location.pathname}>
            <Route
              path={`/${AccountCreationRoute.SeedPhrase}`}
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
                      navigateToNext();
                    }}
                  />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationRoute.SeedPhraseConfirmation}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationRoute.SeedPhraseConfirmation}
                >
                  <SeedPhraseConfirmation
                    seedPhrase={seedPhrase || []}
                    onConfirm={() => navigateToNext()}
                  />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationRoute.Password}`}
              element={
                <AnimatedTransition elementKey={AccountCreationRoute.Password}>
                  <Password
                    accountCreationDetails={accountCreationDetails}
                    onSetAccountCreationDetails={(
                      accountCreationDetailsDelta
                    ) => {
                      setAccountCreationDetails((accountCreationDetails) => {
                        return {
                          ...accountCreationDetails,
                          ...accountCreationDetailsDelta,
                        };
                      });
                    }}
                    onSubmitAccountCreationDetails={(
                      accountCreationDetails
                    ) => {
                      setAccountCreationDetails(accountCreationDetails);
                      navigateToNext();
                    }}
                  />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationRoute.Completion}`}
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
          </Routes>
        </AnimatePresence>
      </RouteContainer>
    </AccountCreationContainer>
  );
};

export default AccountCreation;
