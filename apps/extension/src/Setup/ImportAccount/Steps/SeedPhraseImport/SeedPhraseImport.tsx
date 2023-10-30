import React, { useCallback, useState } from "react";

import { ActionButton, Heading, RadioGroup, Stack } from "@namada/components";
import { SeedPhraseList } from "Setup/Common";
import { HeaderContainer } from "Setup/Setup.components";
import { ValidateMnemonicMsg } from "background/keyring";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { Instruction, InstructionList } from "./SeedPhraseImport.components";

type Props = {
  onConfirm: (seedPhraseAsArray: string[]) => void;
  requester: ExtensionRequester;
};

const SHORT_PHRASE_COUNT = 12;
const LONG_PHRASE_COUNT = 24;

export const SeedPhraseImport: React.FC<Props> = ({ onConfirm, requester }) => {
  const [mnemonicLength, setMnemonicLength] = useState(SHORT_PHRASE_COUNT);

  const mnemonicsRange = Array.from(Array(LONG_PHRASE_COUNT).keys()).map(
    () => ""
  );

  const [mnemonics, setMnemonics] = useState<string[]>(
    Array.from(mnemonicsRange)
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
    (index: number, value: string) => {
      const newMnemonics = [...mnemonics];
      newMnemonics[index] = value;
      setMnemonics(newMnemonics);
    },
    [mnemonics]
  );

  const onSubmit = useCallback(async () => {
    const actualMnemonics = mnemonics.slice(0, mnemonicLength);
    const phrase = actualMnemonics.join(" ");
    const isValid = await requester.sendMessage<ValidateMnemonicMsg>(
      Ports.Background,
      new ValidateMnemonicMsg(phrase)
    );
    if (isValid) {
      onConfirm(actualMnemonics);
    } else {
      alert("Invalid mnemonic");
    }
  }, [mnemonics]);

  return (
    <>
      <HeaderContainer>
        <Heading level="h1" size="3xl">
          Import Account
        </Heading>
      </HeaderContainer>
      <InstructionList>
        <Instruction>
          Enter your recovery phrase in the right order without capitalisation,
          punctuation symbols or spaces.
        </Instruction>
        <Instruction>Or copy and paste your entire phrase. </Instruction>
      </InstructionList>
      <Stack
        as="form"
        gap={14}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Stack direction="vertical" gap={6}>
          <RadioGroup
            id="mnemonicLength"
            groupLabel="Number of seeds"
            value={mnemonicLength.toString()}
            options={[
              { text: "12 words", value: "12" },
              { text: "24 words", value: "24" },
            ]}
            onChange={(value: string) => setMnemonicLength(Number(value))}
          />
          <SeedPhraseList
            sensitive={false}
            words={mnemonics.slice(0, mnemonicLength)}
            onChange={onInputChange}
            onPaste={onPaste}
          />
        </Stack>
        <ActionButton disabled={isSubmitButtonDisabled}>Import</ActionButton>
      </Stack>
    </>
  );
};
