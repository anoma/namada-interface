import React, { useCallback, useState } from "react";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
  Toggle,
} from "@namada/components";

import { ExtensionRequester } from "extension";
import { ValidateMnemonicMsg } from "background/keyring";
import { Ports } from "router";
import {
  SubViewContainer,
  UpperContentContainer,
  Header1,
  BodyText,
  ButtonsContainer,
  SeedPhraseLengthContainer,
  SeedPhraseLength,
} from "Setup/Setup.components";
import { PhraseRecoveryContainer } from "./SeedPhraseImport.components";

type Props = {
  onConfirm: (seedPhraseAsArray: string[]) => void;
  requester: ExtensionRequester;
};

const SHORT_PHRASE_COUNT = 12;
const LONG_PHRASE_COUNT = 24;

export const SeedPhraseImport: React.FC<Props> = ({ onConfirm, requester }) => {
  const [mnemonicLength, setMnemonicLength] = useState(SHORT_PHRASE_COUNT);
  const mnemonicsRange = Array.from(Array(mnemonicLength).keys());
  const [mnemonics, setMnemonics] = useState<string[]>(
    mnemonicsRange.map(() => "")
  );
  const isSubmitButtonDisabled = mnemonics.some((mnemonic) => !mnemonic);

  const onPaste = useCallback(
    (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      let currentLength = mnemonicLength;
      const text = e.clipboardData.getData("Text");
      const pastedMnemonics = text
        .trim()
        .split(/\s+/)
        .slice(0, LONG_PHRASE_COUNT);
      const pastedMnemonicsLength = pastedMnemonics.length;

      // If pasted text has more than SHORT_PHRASE_COUNT words, we automatically toggle words count
      if (pastedMnemonicsLength > SHORT_PHRASE_COUNT) {
        setMnemonicLength(LONG_PHRASE_COUNT);
        currentLength = LONG_PHRASE_COUNT;
      }
      // If pasted text is exactly the same length as the mnemonic length, we want to replace all inputs
      if (pastedMnemonicsLength === currentLength) {
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
      // Otherwise we just paste the text into the focused input - default behavior
    },
    [mnemonicLength]
  );

  const onInputChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const newMnemonics = [...mnemonics];
      newMnemonics[index] = e.target.value;
      setMnemonics(newMnemonics);
    },
    [mnemonics]
  );

  const onImportClick = useCallback(async () => {
    const isValid = await requester.sendMessage<ValidateMnemonicMsg>(
      Ports.Background,
      new ValidateMnemonicMsg(mnemonics.join(" "))
    );
    if (isValid) {
      onConfirm(mnemonics);
    } else {
      alert("Invalid mnemonic");
    }
  }, [mnemonics]);

  return (
    <SubViewContainer>
      <UpperContentContainer>
        <Header1>Import Account</Header1>
      </UpperContentContainer>
      <BodyText>Please enter or paste in recovery phrase.</BodyText>
      <SeedPhraseLengthContainer>
        <SeedPhraseLength>{SHORT_PHRASE_COUNT}</SeedPhraseLength>
        <Toggle
          checked={mnemonicLength === SHORT_PHRASE_COUNT}
          onClick={() => {
            setMnemonicLength(
              mnemonicLength === LONG_PHRASE_COUNT
                ? SHORT_PHRASE_COUNT
                : LONG_PHRASE_COUNT
            );
          }}
        />
        <SeedPhraseLength>{LONG_PHRASE_COUNT}</SeedPhraseLength>
      </SeedPhraseLengthContainer>
      <PhraseRecoveryContainer>
        {mnemonicsRange.map((word, index) => {
          return (
            <Input
              key={`word-${word}`}
              label={`Word ${word + 1}`}
              variant={InputVariants.PasswordOnBlur}
              onChange={onInputChange.bind(null, index)}
              onPaste={onPaste.bind(null, index)}
              value={mnemonics.at(index) || ""}
            />
          );
        })}
      </PhraseRecoveryContainer>
      <ButtonsContainer>
        <Button
          onClick={onImportClick}
          disabled={isSubmitButtonDisabled}
          variant={ButtonVariant.Contained}
        >
          Import
        </Button>
      </ButtonsContainer>
    </SubViewContainer>
  );
};
