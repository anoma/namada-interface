import React, { useState } from "react";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
  Toggle,
} from "@anoma/components";

import {
  SubViewContainer,
  UpperContentContainer,
  Header1,
  BodyText,
  ButtonsContainer,
} from "Setup/Setup.components";
import {
  SeedPhraseLength,
  SeedPhraseLengthContainer,
} from "Setup/AccountCreation/Steps/SeedPhrase/SeedPhrase.components";
import { PhraseRecoveryContainer } from "../ImportAccount.components";
import { ExtensionRequester } from "extension";
import { ValidateMnemonicMsg } from "background/keyring";
import { Ports } from "router";

type Props = {
  onConfirm: (seedPhraseAsArray: string[]) => void;
  requester: ExtensionRequester;
};

export const SeedPhraseImport: React.FC<Props> = ({ onConfirm, requester }) => {
  const [mnemonicLength, setMnemonicLength] = useState(12);
  const mnemonicsRange = Array.from(Array(mnemonicLength).keys());
  const [mnemonics, setMnemonics] = useState<string[]>(
    mnemonicsRange.map(() => "")
  );
  const isSubmitButtonDisabled = mnemonics.some((mnemonic) => !mnemonic);

  return (
    <SubViewContainer>
      <UpperContentContainer>
        <Header1>Import Account</Header1>
      </UpperContentContainer>
      <BodyText>Please enter or paste in recovery phrase.</BodyText>
      <SeedPhraseLengthContainer>
        <SeedPhraseLength>12</SeedPhraseLength>
        <Toggle
          checked={mnemonicLength === 12}
          onClick={() => {
            setMnemonicLength(mnemonicLength === 24 ? 12 : 24);
          }}
        />
        <SeedPhraseLength>24</SeedPhraseLength>
      </SeedPhraseLengthContainer>
      <PhraseRecoveryContainer>
        {mnemonicsRange.map((word, index) => {
          return (
            <Input
              key={`word-${word}`}
              label={`Word ${word + 1}`}
              variant={InputVariants.PasswordOnBlur}
              onChangeCallback={(e) => {
                const newMnemonics = [...mnemonics];
                newMnemonics[index] = e.target.value;
                setMnemonics(newMnemonics);
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("Text");
                const pastedMnemonics = text.trim().split(/\s+/);
                const pastedMnemonicsLength = pastedMnemonics.length;

                // If pasted text is exactly the same length as the mnemonic length, we want to replace all inputs
                if (pastedMnemonicsLength === mnemonicLength) {
                  e.preventDefault();
                  setMnemonics(pastedMnemonics);
                }
                // If the pasted text is more than one word, we want to fill multiple inputs
                else if (pastedMnemonicsLength > 1) {
                  e.preventDefault();
                  // We paste mnemonics to multiple inputs, starting from the focused one
                  const newMnemonics = [
                    ...mnemonics.slice(0, index),
                    ...pastedMnemonics,
                    ...mnemonics.slice(index + pastedMnemonicsLength),
                  ];
                  setMnemonics(newMnemonics);
                }
                // Otherwise we just paste the text into the focused input
              }}
              value={mnemonics.at(index) || ""}
            />
          );
        })}
      </PhraseRecoveryContainer>
      <ButtonsContainer>
        <Button
          onClick={async () => {
            const isValid = await requester.sendMessage<ValidateMnemonicMsg>(
              Ports.Background,
              new ValidateMnemonicMsg(mnemonics.join(" "))
            );
            if (isValid) {
              onConfirm(mnemonics);
            } else {
              alert("Invalid mnemonic");
            }
          }}
          disabled={isSubmitButtonDisabled}
          variant={ButtonVariant.Contained}
        >
          Import
        </Button>
      </ButtonsContainer>
    </SubViewContainer>
  );
};
