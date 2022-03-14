import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { TopLevelRoute } from "App/types";
import {
  KeyPair,
  KeyPairType,
  Mnemonic,
  MnemonicLength,
} from "@anoma-wallet/key-management";
import {
  Start,
  AccountInformation,
  AccountCreationDetails,
  SeedPhrase,
  SeedPhraseConfirmation,
  Completion,
} from "./Steps";
import { AccountCreationRoute, accountCreationSteps } from "./types";
import { AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  MainSectionContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  RouteContainer,
  MotionContainer,
} from "./AccountCreation.components";

import { Button } from "components/Button";
import { Icon, IconName } from "components/Icon";

const LOCAL_STORAGE_STORAGE_VALUE_KEY = "localStorageStorageValue";

const AnimatedTransition = (props: {
  children: React.ReactNode;
  elementKey: string;
  animationFromRightToLeft: boolean;
}): JSX.Element => {
  const { children, elementKey, animationFromRightToLeft } = props;
  return (
    <MotionContainer
      key={elementKey}
      initial={{ opacity: 0, x: (animationFromRightToLeft ? 1 : -1) * 450 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: (animationFromRightToLeft ? -1 : 1) * 450 }}
    >
      {children}
    </MotionContainer>
  );
};

function AccountCreation(): JSX.Element {
  // account details defaults
  const defaultAccountCreationDetails: AccountCreationDetails = {
    seedPhraseLength: "12",
    accountName: "",
  };

  // account details
  const [accountCreationDetails, setAccountCreationDetails] = React.useState(
    defaultAccountCreationDetails
  );
  const [seedPhrase, setSeedPhrase] = React.useState<string[]>();
  const [stepIndex, setStepIndex] = React.useState(0);
  const isLastIndex = accountCreationSteps.length - 1 === stepIndex;
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  // [1] <- |[2]| <- [3]
  const [animationFromRightToLeft, setAnimationFromRightToLeft] =
    React.useState(true);

  const location = useLocation();
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";

  React.useEffect(() => {
    if (
      window.location.pathname ===
      `${TopLevelRoute.AccountCreation}/${AccountCreationRoute.Initiate}`
    ) {
      setAccountCreationDetails(defaultAccountCreationDetails);
      setStepIndex(0);
      setSeedPhrase([]);
      navigate(AccountCreationRoute.Start);
      // navigate(`${accountCreationSteps[stepIndex]}`);
    }
  });

  const navigateToNext = (): void => {
    if (stepIndex >= accountCreationSteps.length - 1) return;
    setStepIndex((stepIndex) => stepIndex + 1);
    navigate(`${accountCreationSteps[stepIndex + 1]}`);
  };

  const navigateToPrevious = (): void => {
    if (stepIndex === 0) return;
    setStepIndex((stepIndex) => {
      return stepIndex - 1;
    });
    navigate(`${accountCreationSteps[stepIndex - 1]}`);
  };

  return (
    <MainSectionContainer>
      <TopSection>
        <TopSectionButtonContainer>
          {!isLastIndex && (
            <Button
              onClick={() => {
                if (stepIndex === 0) {
                  navigate("/");
                }
                navigateToPrevious();
              }}
              onHover={() => {
                setAnimationFromRightToLeft(false);
              }}
              style={{ padding: "0" }}
            >
              <Icon
                iconName={IconName.ChevronLeft}
                strokeColorOverride={backButtonIconStrokeColor}
              />
            </Button>
          )}
        </TopSectionButtonContainer>
        <TopSectionHeaderContainer></TopSectionHeaderContainer>
        <TopSectionButtonContainer></TopSectionButtonContainer>
      </TopSection>
      <RouteContainer>
        <AnimatePresence exitBeforeEnter>
          <Routes location={location} key={location.pathname}>
            <Route
              path={`/${AccountCreationRoute.Start}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationRoute.Start}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <Start
                    onCtaClick={() => {
                      navigateToNext();
                    }}
                    onCtaHover={() => {
                      setAnimationFromRightToLeft(true);
                    }}
                  />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationRoute.AccountDetails}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationRoute.AccountDetails}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <AccountInformation
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
                    onCtaHover={() => {
                      setAnimationFromRightToLeft(true);
                    }}
                  />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationRoute.SeedPhrase}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationRoute.SeedPhrase}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <SeedPhrase
                    accountCreationDetails={accountCreationDetails}
                    defaultSeedPhrase={seedPhrase}
                    onConfirmSavingOfSeedPhrase={(seedPhrase: string[]) => {
                      setSeedPhrase(seedPhrase);
                      navigateToNext();
                    }}
                    onCtaHover={() => {
                      setAnimationFromRightToLeft(true);
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
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <SeedPhraseConfirmation
                    seedPhrase={seedPhrase || []}
                    onConfirmSeedPhrase={() => {
                      navigateToNext();

                      // TODO
                      // likely best to move the key creation to the loading of
                      // the completion screen so that the user do not get the
                      // bad UX by seeing a noticeable delay

                      if (
                        accountCreationDetails.password &&
                        accountCreationDetails.seedPhraseLength
                      ) {
                        const mnemonicLength =
                          accountCreationDetails.seedPhraseLength.length === 12
                            ? MnemonicLength.Twelve
                            : MnemonicLength.TwentyFour;

                        const mnemonic: Mnemonic = new Mnemonic(
                          mnemonicLength,
                          seedPhrase?.join(" ")
                        );

                        const keyPair = KeyPair.fromMnemonic(
                          mnemonic,
                          accountCreationDetails.password
                        );

                        console.log(keyPair.getStorageValue());
                      }
                    }}
                    onCtaHover={() => {
                      setAnimationFromRightToLeft(true);
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
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <Completion
                    onClickDone={() => {
                      navigate("/");
                    }}
                    onClickSeeAccounts={() => {
                      navigate("/");
                    }}
                  />
                </AnimatedTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </RouteContainer>
    </MainSectionContainer>
  );
}

export default AccountCreation;
