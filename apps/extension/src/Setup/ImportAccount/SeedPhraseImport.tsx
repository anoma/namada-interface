import React, { useCallback, useState } from "react";

import {
  ActionButton,
  Alert,
  Input,
  LinkButton,
  RadioGroup,
  Stack,
} from "@namada/components";
import { assertNever } from "@namada/utils";
import { SeedPhraseList } from "Setup/Common";
import { AccountSecret, ValidateMnemonicMsg } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { GoX } from "react-icons/go";
import { Ports } from "router";
import { fillArray, filterPrivateKeyPrefix, validatePrivateKey } from "utils";

type Props = {
  onConfirm: (accountSecret: AccountSecret) => void;
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
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
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

  const privateKeyError = (() => {
    const validation = validatePrivateKey(filterPrivateKeyPrefix(privateKey));
    if (validation.ok) {
      return "";
    } else {
      switch (validation.error.t) {
        case "TooLong":
          return `Private key must be no more than
             ${validation.error.maxLength} characters long`;
        case "BadCharacter":
          return "Private key may only contain characters 0-9, a-f";
        default:
          return assertNever(validation.error);
      }
    }
  })();

  const isSubmitButtonDisabled =
    mnemonicType === MnemonicTypes.PrivateKey
      ? privateKey === "" || privateKeyError !== ""
      : mnemonics.slice(0, mnemonicType).some((mnemonic) => !mnemonic);

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
      // TODO: validate here
      onConfirm({
        t: "PrivateKey",
        privateKey: filterPrivateKeyPrefix(privateKey),
      });
    } else {
      const actualMnemonics = mnemonics.slice(0, mnemonicType);
      const phrase = actualMnemonics.join(" ");
      const { isValid, error } =
        await requester.sendMessage<ValidateMnemonicMsg>(
          Ports.Background,
          new ValidateMnemonicMsg(phrase)
        );
      if (isValid) {
        setMnemonicError(undefined);
        onConfirm({ t: "Mnemonic", seedPhrase: actualMnemonics, passphrase });
      } else {
        setMnemonicError(error);
      }
    }
  }, [mnemonics, mnemonicType, privateKey, passphrase, showPassphrase]);

  const onPassphraseChange = useCallback(
    (value: string) => {
      setPassphrase(value);
    },
    [passphrase]
  );

  const onShowPassphraseChange = useCallback(
    (e) => {
      e.preventDefault();
      if (!showPassphrase) {
        setPassphrase("");
      }
      setShowPassphrase(!showPassphrase);
    },
    [showPassphrase]
  );

  return (
    <>
      <Stack
        as="ul"
        gap={1}
        className="text-sm list-disc mb-5 px-6 text-white font-medium"
      >
        <li>
          Enter your seed phrase in the right order without capitalisation,
          punctuation symbols or spaces.
        </li>
        <li>Or copy and paste your entire phrase. </li>
      </Stack>
      <Stack
        as="form"
        gap={3}
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit();
        }}
      >
        <Stack direction="vertical" gap={2.5}>
          {mnemonicError && <Alert type={"error"}>{mnemonicError}</Alert>}
          <RadioGroup
            id="mnemonicLength"
            groupLabel="Number of seeds"
            value={mnemonicType.toString()}
            options={[
              {
                text: "12 words",
                value: MnemonicTypes.TwelveWords.toString(),
              },
              {
                text: "24 words",
                value: MnemonicTypes.TwentyFourWords.toString(),
              },
              {
                text: "Private Key",
                value: MnemonicTypes.PrivateKey.toString(),
              },
            ]}
            onChange={(value: string) => {
              if (Number(value) === MnemonicTypes.PrivateKey) {
                setShowPassphrase(false);
                setPassphrase("");
              }
              setMnemonicType(Number(value));
            }}
          />

          {mnemonicType !== MnemonicTypes.PrivateKey && (
            <SeedPhraseList
              sensitive={false}
              columns={mnemonicType === MnemonicTypes.TwentyFourWords ? 4 : 3}
              words={fillArray(mnemonics.slice(0, mnemonicType), mnemonicType)}
              onChange={onInputChange}
              onPaste={onPaste}
            />
          )}

          {mnemonicType === MnemonicTypes.PrivateKey && (
            <Input
              className="w-full"
              label="Private key"
              variant="PasswordOnBlur"
              value={privateKey}
              placeholder="Enter your private key"
              onChange={(e) => setPrivateKey(e.target.value)}
              error={privateKeyError}
            />
          )}
        </Stack>
        <Stack direction="vertical" gap={4}>
          {showPassphrase && (
            <div className="relative">
              <div onClick={onShowPassphraseChange}>
                <i className="block text-lg absolute top-5 right-4 text-white cursor-pointer">
                  <GoX />
                </i>
              </div>
              <Alert type={"warning"} title={"Please note"} className="mb-3">
                <Stack gap={6}>
                  <p className="text-[13px] leading-[1.25] text-white">
                    This import option is only users who have created a Namada
                    account using the Namada protocol CLI v.0.17.0 or older, and
                    used a BIP39 passphrase. Do not input your Namada extension
                    password
                  </p>
                  <Input
                    data-testid="setup-import-keys-passphrase-input"
                    label="Enter your passphrase"
                    placeholder="Optional passphrase for your seed phrase."
                    hideIcon={true}
                    onChange={(e) => onPassphraseChange(e.target.value)}
                    value={passphrase}
                  />
                </Stack>
              </Alert>
            </div>
          )}
          {!showPassphrase && mnemonicType !== MnemonicTypes.PrivateKey && (
            <LinkButton
              data-testid="setup-import-keys-use-passphrase-button"
              className="text-xs !text-neutral-400"
              onClick={onShowPassphraseChange}
              type="button" // makes enter key ignore this and submit form
            >
              Import with BIP39 Passphrase
            </LinkButton>
          )}
          <ActionButton
            size="lg"
            data-testid="setup-import-keys-import-button"
            disabled={isSubmitButtonDisabled}
            type="submit"
          >
            Next
          </ActionButton>
        </Stack>
      </Stack>
    </>
  );
};
