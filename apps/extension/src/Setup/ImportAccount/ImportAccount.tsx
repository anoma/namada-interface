import React, { useContext, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";

import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Input,
  InputVariants,
  Toggle,
} from "@anoma/components";

import {
  SubViewContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  UpperContentContainer,
  Header1,
  BodyText,
  ButtonsContainer,
} from "Setup/Setup.components";
import {
  SeedPhraseLength,
  SeedPhraseLengthContainer,
} from "Setup/AccountCreation/Steps/SeedPhrase/SeedPhrase.components";
import { PhraseRecoveryContainer } from "./ImportAccount.components";
import { RouteContainer } from "Setup/AccountCreation/AccountCreation.components";
import { AnimatePresence } from "framer-motion";

const ImportAccount: React.FC = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const [mnemonicLength, setMnemonicLength] = useState(12);
  const mnemonicsRange = Array.from(Array(mnemonicLength).keys());
  const [mnemonics, setMnemonics] = useState<string[]>(
    mnemonicsRange.map(() => "")
  );
  const isSubmitButtonDisabled = mnemonics.some((mnemonic) => !mnemonic);

  return (
    <SubViewContainer>
      <TopSection>
        <TopSectionButtonContainer>
          <a onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <Icon
              iconName={IconName.ChevronLeft}
              strokeColorOverride={themeContext.colors.utility2.main60}
              iconSize={IconSize.L}
            />
          </a>
        </TopSectionButtonContainer>

        <TopSectionHeaderContainer></TopSectionHeaderContainer>
      </TopSection>

      <RouteContainer>
        <AnimatePresence exitBeforeEnter>
          <Outlet />
        </AnimatePresence>
      </RouteContainer>
    </SubViewContainer>
  );
};

export default ImportAccount;

// <UpperContentContainer>
//   <Header1>Import Account</Header1>
// </UpperContentContainer>
// <BodyText>Please enter or paste in recovery phrase.</BodyText>
// <SeedPhraseLengthContainer>
//   <SeedPhraseLength>12</SeedPhraseLength>
//   <Toggle
//     checked={mnemonicLength === 12}
//     onClick={() => {
//       setMnemonicLength(mnemonicLength === 24 ? 12 : 24);
//     }}
//   />
//   <SeedPhraseLength>24</SeedPhraseLength>
// </SeedPhraseLengthContainer>
// <PhraseRecoveryContainer>
//   {mnemonicsRange.map((word, index) => {
//     return (
//       <Input
//         key={`word-${word}`}
//         label={`Word ${word + 1}`}
//         variant={InputVariants.Text}
//         onChangeCallback={(e) => {
//           const newMnemonics = [...mnemonics];
//           newMnemonics[index] = e.target.value;
//           setMnemonics(newMnemonics);
//         }}
//         onPaste={(e) => {
//           e.preventDefault();
//           const text = e.clipboardData.getData("Text");
//           const mnemonics = text.split(/\s+/);
//           setMnemonics(mnemonics);
//         }}
//         value={mnemonics.at(index) || ""}
//       />
//     );
//   })}
// </PhraseRecoveryContainer>
// <ButtonsContainer>
//   <Button
//     onClick={() => {
//       alert("CLICK");
//     }}
//     disabled={isSubmitButtonDisabled}
//     variant={ButtonVariant.Contained}
//   >
//     Import
//   </Button>
// </ButtonsContainer>
