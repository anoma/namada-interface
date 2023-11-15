import React, { useCallback, useState } from "react";

import {
  ActionButton,
  Alert,
  Heading,
  Input,
  InputVariants,
  RadioGroup,
  Stack,
} from "@namada/components";
import { SeedPhraseList } from "Setup/Common";
import { HeaderContainer } from "Setup/Setup.components";
import { ValidateMnemonicMsg } from "background/keyring";
import { Ports } from "router";
import { Instruction, InstructionList } from "./SeedPhraseImport.components";
import { useRequester } from "hooks/useRequester";

type Props = {
  onConfirm: (seedPhraseAsArray: string[]) => void;
};

const SHORT_PHRASE_COUNT = 12;
const LONG_PHRASE_COUNT = 24;

enum MnemonicTypes {
  PrivateKey = 1,
  TwelveWords = SHORT_PHRASE_COUNT,
  TwentyFourWords = LONG_PHRASE_COUNT,
}

export const SeedPhraseImport: React.FC<Props> = ({ onConfirm }) => {
  const requester = useRequester();
  const [privateKey, setPrivateKey] = useState("");
  const [mnemonicType, setMnemonicType] = useState<MnemonicTypes>(
    MnemonicTypes.TwelveWords
  );
  const [mnemonicError, setMnemonicError] = useState<string>();

  const mnemonicsRange = Array.from(Array(LONG_PHRASE_COUNT).keys()).map(
    () => ""
  );

  const [mnemonics, setMnemonics] = useState<string[]>(
    Array.from(mnemonicsRange)
  );

  const isSubmitButtonDisabled = mnemonics.some((mnemonic) => !mnemonic);

  const onPaste = useCallback(
    (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      let currentLength = mnemonicType;
      const text = e.clipboardData.getData("Text");
      const pastedMnemonics = text
        .trim()
        .split(/\s+/)
        .slice(0, LONG_PHRASE_COUNT);
      const pastedMnemonicsLength = pastedMnemonics.length;

      // If pasted text has more than SHORT_PHRASE_COUNT words, we automatically toggle words count
      if (pastedMnemonicsLength > SHORT_PHRASE_COUNT) {
        setMnemonicType(MnemonicTypes.TwentyFourWords);
        currentLength = MnemonicTypes.TwentyFourWords;
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
    [mnemonicType]
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
    if (mnemonicType === MnemonicTypes.PrivateKey) {
      return;
    }

    const actualMnemonics = mnemonics.slice(0, mnemonicType);
    const phrase = actualMnemonics.join(" ");
    const { isValid, error } = await requester.sendMessage<ValidateMnemonicMsg>(
      Ports.Background,
      new ValidateMnemonicMsg(phrase)
    );
    if (isValid) {
      setMnemonicError(undefined);
      onConfirm(actualMnemonics);
    } else {
      setMnemonicError(error);
    }
  }, [mnemonics]);

  return (
    <>
      <HeaderContainer>
        <Heading uppercase level="h1" size="3xl">
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
          {mnemonicError && <Alert type={"error"}>{mnemonicError}</Alert>}
          <RadioGroup
            id="mnemonicLength"
            groupLabel="Number of seeds"
            value={mnemonicType.toString()}
            options={[
              { text: "12 words", value: MnemonicTypes.TwelveWords.toString() },
              {
                text: "24 words",
                value: MnemonicTypes.TwentyFourWords.toString(),
              },
              {
                text: "Private Key",
                value: MnemonicTypes.PrivateKey.toString(),
              },
            ]}
            onChange={(value: string) => setMnemonicType(Number(value))}
          />

          {mnemonicType !== MnemonicTypes.PrivateKey && (
            <SeedPhraseList
              sensitive={false}
              columns={mnemonicType === MnemonicTypes.TwentyFourWords ? 4 : 3}
              words={mnemonics.slice(0, mnemonicType)}
              onChange={onInputChange}
              onPaste={onPaste}
            />
          )}

          {mnemonicType === MnemonicTypes.PrivateKey && (
            <Input
              label="Private key"
              variant={InputVariants.PasswordOnBlur}
              value={privateKey}
              placeholder="Enter your private key"
              onChange={(e) => setPrivateKey(e.target.value)}
            />
          )}
        </Stack>
        <ActionButton disabled={isSubmitButtonDisabled}>Import</ActionButton>
      </Stack>
    </>
  );
};
