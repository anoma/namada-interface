import React, { useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "styled-components";

import { Mnemonic, MnemonicLength } from "@anoma-wallet/key-management";

import { Button } from "components/ButtonTemporary";
import { Icon, IconName } from "components/Icon";
import {
  TopLevelRoute,
  LOCAL_STORAGE_MASTER_SEED_VALUE,
  LOCAL_STORAGE_MASTER_KEY_PAIR_ALIAS,
} from "App/types";

import {
  Start,
  AccountInformation,
  AccountCreationDetails,
  SeedPhrase,
  SeedPhraseConfirmation,
  Completion,
} from "./Steps";
import { AccountCreationRoute, accountCreationSteps } from "./types";
import {
  AccountCreationContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  RouteContainer,
  MotionContainer,
} from "./AccountCreation.components";

type AnimatedTransitionProps = {
  elementKey: string;
  // the actual page content that slides in/out
  children: React.ReactElement;
  // consumer has a logic that decides if the transition is from left to right or the opposite
  animationFromRightToLeft: boolean;
};

/**
 * this is a utility to facilitate the animated transitions (slide from side).
 * This should be extracted to it's own component along the other transition types. TODO
 */
const AnimatedTransition = (
  props: AnimatedTransitionProps
): React.ReactElement => {
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

/**
 * The main purpose of this is to coordinate the flow for creating a new account.
 * it persist the data and coordinates the logic for animating the transitions
 * between the screens in the flow.
 */
function AccountCreation(): JSX.Element {
  // account details defaults
  const defaultAccountCreationDetails: AccountCreationDetails = {
    seedPhraseLength: "12",
    accountName: "",
  };

  // We only persist these between the navigating in the flow,
  // password unlikely as the user could forget it when navigating back and forth
  const [accountCreationDetails, setAccountCreationDetails] = React.useState(
    defaultAccountCreationDetails
  );
  const [seedPhrase, setSeedPhrase] = React.useState<string[]>();
  const [stepIndex, setStepIndex] = React.useState(0);
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  // this is for keeping tract about to what direction the view will disappear
  // when the screen is rendered we cannot know if it should leave to left or right
  // so we can set this by user hovering on next or back buttons
  // TODO: if user uses the browsers back button we cannot do this correctly
  // defaults left to right [1] <- |[2]| <- [3]
  const [animationFromRightToLeft, setAnimationFromRightToLeft] =
    React.useState(true);

  // we need the location to figure out if the routes ends with "/initiate"
  // to indicate a starting of a new flow
  const location = useLocation();

  // info for disabling the back button in the last step
  const isLastIndex = accountCreationSteps.length - 1 === stepIndex;

  // this is a temp as the designs are not final, coloring SVG icon with this
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";

  React.useEffect(() => {
    // at the load we redirect to the first step
    // this way we do not need to expose the flow routes to outside
    navigate(AccountCreationRoute.Start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToNext = (): void => {
    setStepIndex((stepIndex) => stepIndex + 1);
    navigate(`${accountCreationSteps[stepIndex + 1]}`);
  };

  const navigateToPrevious = (): void => {
    // if we are on the first step and the user clicks back
    // we leave the whole flow
    if (stepIndex === 0) {
      navigate(TopLevelRoute.SettingsAccounts);
      return;
    }

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
            <Button
              onClick={() => {
                navigateToPrevious();
              }}
              onHover={() => {
                // read the need for this above the hook
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
                      // read the need for this above the hook
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
                      // read the need for this above the hook
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
                      // read the need for this above the hook
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

                      const createKeyPair = async (): Promise<void> => {
                        // TODO
                        // likely best to move the key creation to the loading of
                        // the completion screen so that the user do not get the
                        // bad UX by seeing a noticeable delay
                        if (
                          accountCreationDetails.password &&
                          accountCreationDetails.seedPhraseLength &&
                          accountCreationDetails.accountName
                        ) {
                          const mnemonicLength =
                            accountCreationDetails.seedPhraseLength.length ===
                            12
                              ? MnemonicLength.Twelve
                              : MnemonicLength.TwentyFour;

                          const mnemonic: Mnemonic =
                            await Mnemonic.fromMnemonic(mnemonicLength);

                          window.localStorage.setItem(
                            LOCAL_STORAGE_MASTER_KEY_PAIR_ALIAS,
                            accountCreationDetails.accountName
                          );

                          window.localStorage.setItem(
                            LOCAL_STORAGE_MASTER_SEED_VALUE,
                            await mnemonic.toStorageValue(
                              accountCreationDetails.password
                            )
                          );
                        } else {
                          alert(
                            "something is wrong with the KeyPair creation 🤨"
                          );
                        }
                      };

                      createKeyPair();
                    }}
                    onCtaHover={() => {
                      // read the need for this above the hook
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
                      navigate(TopLevelRoute.SettingsAccounts);
                    }}
                    onClickSeeAccounts={() => {
                      navigate(TopLevelRoute.Wallet);
                    }}
                  />
                </AnimatedTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </RouteContainer>
    </AccountCreationContainer>
  );
}

export default AccountCreation;
