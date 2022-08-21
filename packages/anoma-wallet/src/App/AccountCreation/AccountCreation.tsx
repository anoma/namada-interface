import { useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "styled-components";

import { TopLevelRoute } from "App/types";
import { AccountCreationRoute, accountCreationSteps } from "./types";
import { AppStore } from "store/store";

import { Icon, IconName, IconSize } from "components/Icon";
import {
  Start,
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
import { AccountCreationDetails } from "./Steps/SeedPhrase/SeedPhrase";

type AnimatedTransitionProps = {
  elementKey: string;
  // the actual page content that slides in/out
  children: JSX.Element;
  // consumer has a logic that decides if the transition is from left to right or the opposite
  animationFromRightToLeft: boolean;
};

/**
 * this is a utility to facilitate the animated transitions (slide from side).
 * This should be extracted to it's own component along the other transition types. TODO
 */
const AnimatedTransition = (props: AnimatedTransitionProps): JSX.Element => {
  const { children, elementKey /*, animationFromRightToLeft */ } = props;
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
  setStore: (password: string) => void;
  setPassword: (password: string) => void;
  store: AppStore | undefined;
};
/**
 * The main purpose of this is to coordinate the flow for creating a new account.
 * it persist the data and coordinates the logic for animating the transitions
 * between the screens in the flow.
 */
function AccountCreation({ setStore, store, setPassword }: Props): JSX.Element {
  // account details defaults
  const defaultAccountCreationDetails: AccountCreationDetails = {
    seedPhraseLength: "12",
    accountName: "",
  };

  // We only persist these between the navigating in the flow,
  // password unlikely as the user could forget it when navigating back and forth
  const [accountCreationDetails, setAccountCreationDetails] = useState(
    defaultAccountCreationDetails
  );
  const [seedPhrase, setSeedPhrase] = useState<string[]>();
  const [stepIndex, setStepIndex] = useState(0);

  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  // this is for keeping tract about to what direction the view will disappear
  // when the screen is rendered we cannot know if it should leave to left or right
  // so we can set this by user hovering on next or back buttons
  // TODO: if user uses the browsers back button we cannot do this correctly
  // defaults left to right [1] <- |[2]| <- [3]
  const [animationFromRightToLeft, setAnimationFromRightToLeft] =
    useState(true);

  // we need the location to figure out if the routes ends with "/initiate"
  // to indicate a starting of a new flow
  const location = useLocation();

  // info for disabling the back button in the last step
  const isLastIndex = accountCreationSteps.length - 1 === stepIndex;

  useEffect(() => {
    // at the load we redirect to the first step
    // this way we do not need to expose the flow routes to outside
    navigate(AccountCreationRoute.Start);
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
                    onConfirmSeedPhrase={() => navigateToNext()}
                    onCtaHover={() => {
                      // read the need for this above the hook
                      setAnimationFromRightToLeft(true);
                    }}
                  />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationRoute.Password}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationRoute.Password}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <Password
                    accountCreationDetails={accountCreationDetails}
                    setStore={setStore}
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
            {store && (
              <Route
                path={`/${AccountCreationRoute.Completion}`}
                element={
                  <AnimatedTransition
                    elementKey={AccountCreationRoute.Completion}
                    animationFromRightToLeft={animationFromRightToLeft}
                  >
                    <Provider store={store}>
                      <Completion
                        setPassword={setPassword}
                        mnemonic={(seedPhrase || []).join(" ")}
                        password={accountCreationDetails.password || ""}
                      />
                    </Provider>
                  </AnimatedTransition>
                }
              />
            )}
          </Routes>
        </AnimatePresence>
      </RouteContainer>
    </AccountCreationContainer>
  );
}

export default AccountCreation;
