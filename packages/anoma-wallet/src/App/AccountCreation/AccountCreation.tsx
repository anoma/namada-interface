import { useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "styled-components";

import { TopLevelRoute } from "App/types";
import { AccountCreationRoute, accountCreationSteps } from "./types";
import { AppStore } from "store/store";

import { Button } from "components/ButtonTemporary";
import { Icon, IconName } from "components/Icon";
import {
  Start,
  AccountInformation,
  AccountCreationDetails,
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
import { Session } from "lib";

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

type Props = {
  setStore: (password: string) => void;
  setIsLoggedIn: () => void;
  store: AppStore | undefined;
};
/**
 * The main purpose of this is to coordinate the flow for creating a new account.
 * it persist the data and coordinates the logic for animating the transitions
 * between the screens in the flow.
 */
function AccountCreation({
  setStore,
  setIsLoggedIn,
  store,
}: Props): JSX.Element {
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

  // this is a temp as the designs are not final, coloring SVG icon with this
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";

  useEffect(() => {
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

  // Establish login session abd store mnemonic
  const setSession = async (
    mnemonic: string,
    password: string
  ): Promise<void> => {
    const session = new Session().setSession(password);
    await session.setSeed(mnemonic);
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
                    onConfirmSeedPhrase={async () => {
                      await setSession(
                        (seedPhrase || []).join(" "),
                        accountCreationDetails.password || ""
                      );
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
                        onClickDone={() => {
                          navigate(TopLevelRoute.SettingsAccounts);
                        }}
                        onClickSeeAccounts={() => {
                          setIsLoggedIn && setIsLoggedIn();
                          navigate(TopLevelRoute.Wallet);
                        }}
                        mnemonic={(seedPhrase || []).join(" ")}
                        alias={accountCreationDetails.accountName || ""}
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
