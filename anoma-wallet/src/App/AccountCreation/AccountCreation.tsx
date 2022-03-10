import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Start,
  AccountInformation,
  SeedPhrase,
  SeedPhraseConfirmation,
  Completion,
} from "./Steps";
import { AccountCreationStep, accountCreationSteps } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  MainSectionContainer,
  TopSection,
  TopSectionHeaderContainer,
  ContentContainer,
  TopSectionButtonContainer,
  Headline,
  RouteContainer,
  MotionContainer,
} from "./AccountCreation.components";

import {
  Mnemonic,
  MnemonicLength,
  KeyPair,
  KeyPairType,
} from "@anoma-wallet/key-management";
import { Button } from "components/Button";
import { Icon, IconName } from "components/Icon";

const LOCAL_STORAGE_STORAGE_VALUE_KEY = "localStorageStorageValue";

// function AccountCreation_(): JSX.Element {
//   const [publicKey, setPublicKey] = React.useState("");
//   const [secretKey, setSecretKey] = React.useState("");
//   const [mnemonic, setMnemonic] = React.useState("");
//   const [storageValue, setStorageValue] = React.useState("");
//   React.useEffect(() => {
//     const init = async (): Promise<void> => {
//       let keyPair;
//       const persistedStorageValue = localStorage.getItem(
//         LOCAL_STORAGE_STORAGE_VALUE_KEY
//       );
//       if (persistedStorageValue) {
//         const storageValue = KeyPair.storageValueStringToStorageValue(
//           persistedStorageValue
//         );
//         if (storageValue?.keyPairType === KeyPairType.Encrypted) {
//           const passwordToDecrypt =
//             prompt("Please a password to decrypt the keys") || "";

//           try {
//             keyPair = await KeyPair.fromStorageValue(
//               storageValue,
//               KeyPairType.Encrypted,
//               passwordToDecrypt
//             );
//           } catch {
//             setStorageValue(storageValue.value);
//             setPublicKey("You provided wrong password");
//             setSecretKey("You provided wrong password");
//             return;
//           }
//         } else if (storageValue) {
//           keyPair = await KeyPair.fromStorageValue(
//             storageValue,
//             KeyPairType.Raw
//           );
//         } else {
//           return;
//         }
//       } else {
//         const mnemonic = await Mnemonic.fromMnemonic(MnemonicLength.TwentyFour);
//         // we need a password to encrypt the value
//         const passwordToEncrypt =
//           prompt("Please enter a password to encrypt the keys") || "";
//         keyPair = KeyPair.fromMnemonic(mnemonic, passwordToEncrypt);
//         setMnemonic(mnemonic.value);
//       }

//       const keyPairStorageString = keyPair.getStorageValue();

//       localStorage.setItem(
//         LOCAL_STORAGE_STORAGE_VALUE_KEY,
//         keyPairStorageString.value
//       );

//       // setMnemonic(mnemonic.value);
//       setStorageValue(keyPairStorageString.value);
//       if (keyPair) {
//         setPublicKey(keyPair.getPublicKeyAsHex());
//         setSecretKey(keyPair.getSecretKeyAsHex());
//       } else {
//         setPublicKey("could not encrypt");
//         setSecretKey("could not encrypt");
//       }
//     };
//     init();
//   }, []);
//   const navigate = useNavigate();
//   const themeContext = useContext(ThemeContext);
//   const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
//     ? themeContext.colors.border
//     : "black";
//   return (<div></div>);
// }

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
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = React.useState(0);
  // [1] <- |[2]| <- [3]
  const [animationFromRightToLeft, setAnimationFromRightToLeft] =
    React.useState(true);

  const location = useLocation();
  const backButtonIconStrokeColor = themeContext.themeConfigurations.isLightMode
    ? themeContext.colors.border
    : "black";

  React.useEffect(() => {
    navigate(`${accountCreationSteps[stepIndex]}`);
  }, []);

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
          <Button
            onClick={() => {
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
        </TopSectionButtonContainer>
        <TopSectionHeaderContainer></TopSectionHeaderContainer>
        <TopSectionButtonContainer>
          <Button
            onClick={() => {
              navigateToNext();
            }}
            onHover={() => {
              setAnimationFromRightToLeft(true);
            }}
            style={{ padding: "0" }}
          >
            <Icon
              iconName={IconName.ChevronRight}
              strokeColorOverride={backButtonIconStrokeColor}
            />
          </Button>
        </TopSectionButtonContainer>
      </TopSection>
      <RouteContainer>
        <AnimatePresence exitBeforeEnter>
          <Routes location={location} key={location.pathname}>
            <Route
              path={`/${AccountCreationStep.Start}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationStep.Start}
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
              path={`/${AccountCreationStep.AccountDetails}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationStep.AccountDetails}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <AccountInformation />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationStep.SeedPhrase}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationStep.SeedPhrase}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <SeedPhrase />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationStep.SeedPhraseConfirmation}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationStep.SeedPhraseConfirmation}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <SeedPhraseConfirmation />
                </AnimatedTransition>
              }
            />
            <Route
              path={`/${AccountCreationStep.Completion}`}
              element={
                <AnimatedTransition
                  elementKey={AccountCreationStep.Completion}
                  animationFromRightToLeft={animationFromRightToLeft}
                >
                  <Completion />
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
