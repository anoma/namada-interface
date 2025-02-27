import React, { useCallback, useState } from "react";

import {
  ActionButton,
  Alert,
  Input,
  RadioGroup,
  Stack,
} from "@namada/components";
import { Bip44Path, Zip32Path } from "@namada/types";
import { assertNever } from "@namada/utils";
import { AccountSecret, ValidateMnemonicMsg } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { SeedPhraseList } from "Setup/Common";
import { AdvancedOptions } from "Setup/Common/AdvancedOptions";
import { AdvancedOptionsMenu } from "Setup/Common/AdvancedOptionsMenu";
import {
  fillArray,
  filterPrivateKeyPrefix,
  validatePrivateKey,
  validateSpendingKey,
} from "utils";

type Props = {
  onConfirm: (accountSecret: AccountSecret) => void;
  bip44Path: Bip44Path;
  zip32Path: Zip32Path;
  setBip44Path: (path: Bip44Path) => void;
  setZip32Path: (path: Zip32Path) => void;
};

const SHORT_PHRASE_COUNT = 12;
const LONG_PHRASE_COUNT = 24;

enum SecretType {
  PrivateKey = 1,
  MnemonicTwelveWords = SHORT_PHRASE_COUNT,
  MnemonicTwentyFourWords = LONG_PHRASE_COUNT,
  SpendingKey = 4,
}

export const SeedPhraseImport: React.FC<Props> = ({
  onConfirm,
  bip44Path,
  zip32Path,
  setBip44Path,
  setZip32Path,
}) => {
  const requester = useRequester();
  const [privateKey, setPrivateKey] = useState("");
  const [spendingKey, setSpendingKey] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [bip39Passphrase, setBip39Passphrase] = useState("");
  const [invalidWordIndex, setInvalidWordIndex] = useState<number>();
  const [secretType, setSecretType] = useState<SecretType>(
    SecretType.MnemonicTwelveWords
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

  const spendingKeyError = (() => {
    const validation = validateSpendingKey(spendingKey);
    if (validation.ok) {
      return "";
    } else {
      switch (validation.error.t) {
        case "IncorrectLength":
          return `Spending key must be of length ${validation.error.length}`;
        case "BadPrefix":
          return `Invalid prefix! Spending keys begin with ${validation.error.prefix}`;
        default:
          return assertNever(validation.error);
      }
    }
  })();

  const isSubmitButtonDisabled =
    secretType === SecretType.PrivateKey ?
      privateKey === "" || privateKeyError !== ""
    : secretType === SecretType.SpendingKey ?
      spendingKey === "" || spendingKeyError !== ""
    : mnemonics.slice(0, secretType).some((mnemonic) => !mnemonic);

  const onPaste = useCallback(
    (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      let currentLength = secretType;
      const text = e.clipboardData.getData("Text");
      const pastedMnemonics = text
        .trim()
        .split(/\s+/)
        .slice(0, LONG_PHRASE_COUNT);
      const pastedMnemonicsLength = pastedMnemonics.length;

      // If pasted text has more than SHORT_PHRASE_COUNT words, we automatically toggle words count
      if (pastedMnemonicsLength > SHORT_PHRASE_COUNT) {
        setSecretType(SecretType.MnemonicTwentyFourWords);
        currentLength = SecretType.MnemonicTwentyFourWords;
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
    [secretType]
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
    if (secretType === SecretType.PrivateKey) {
      // TODO: validate here
      onConfirm({
        t: "PrivateKey",
        privateKey: filterPrivateKeyPrefix(privateKey),
      });
    } else if (secretType === SecretType.SpendingKey) {
      onConfirm({
        t: "ShieldedKeys",
        spendingKey,
      });
    } else {
      const actualMnemonics = mnemonics.slice(0, secretType);
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
        const isInvalidWord = /^invalid word in phrase with index \d+$/.test(
          `${error}`
        );
        if (isInvalidWord) {
          // get index from error
          const matches = error?.match(/\d+$/);
          const invalidWordIndex = matches ? parseInt(matches[0]) : undefined;
          setInvalidWordIndex(invalidWordIndex);
          typeof invalidWordIndex === "number" ?
            setMnemonicError(`Word #${invalidWordIndex + 1} is invalid!`)
          : setMnemonicError(error);
        } else {
          setMnemonicError(error);
        }
      }
    }
  }, [
    mnemonics,
    secretType,
    privateKey,
    spendingKey,
    passphrase,
    showAdvancedOptions,
  ]);

  return (
    <>
      <Stack
        as="ul"
        gap={1}
        className="text-sm list-disc mb-5 px-6 text-white font-medium"
      >
        {secretType !== SecretType.PrivateKey &&
          secretType !== SecretType.SpendingKey && (
            <>
              <li>
                Enter your seed phrase in the right order without
                capitalisation, punctuation symbols or spaces.
              </li>
              <li>Or copy and paste your entire phrase.</li>
            </>
          )}
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
            value={secretType.toString()}
            options={[
              {
                text: "12 words",
                value: SecretType.MnemonicTwelveWords.toString(),
              },
              {
                text: "24 words",
                value: SecretType.MnemonicTwentyFourWords.toString(),
              },
              {
                text: "Private Key",
                value: SecretType.PrivateKey.toString(),
              },
              {
                text: "Spending Key",
                value: SecretType.SpendingKey.toString(),
              },
            ]}
            onChange={(value: string) => {
              if (
                Number(value) === SecretType.PrivateKey ||
                Number(value) === SecretType.SpendingKey
              ) {
                setShowAdvancedOptions(false);
                setPassphrase("");
              }
              setSecretType(Number(value));
            }}
          />

          {secretType !== SecretType.PrivateKey &&
            secretType !== SecretType.SpendingKey && (
              <SeedPhraseList
                invalidWordIndex={invalidWordIndex}
                sensitive={false}
                columns={
                  secretType === SecretType.MnemonicTwentyFourWords ? 4 : 3
                }
                words={fillArray(mnemonics.slice(0, secretType), secretType)}
                onChange={onInputChange}
                onPaste={onPaste}
              />
            )}

          {secretType === SecretType.PrivateKey && (
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

          {secretType === SecretType.SpendingKey && (
            <Input
              className="w-full"
              label="Spending key"
              variant="PasswordOnBlur"
              value={spendingKey}
              placeholder="Enter your spending key"
              onChange={(e) => setSpendingKey(e.target.value)}
              error={spendingKeyError}
            />
          )}
        </Stack>
        <Stack direction="vertical" gap={4}>
          {secretType === SecretType.MnemonicTwelveWords ||
            (secretType === SecretType.MnemonicTwentyFourWords && (
              <AdvancedOptions>
                <AdvancedOptionsMenu
                  bip44Path={bip44Path}
                  zip32Path={zip32Path}
                  setBip44Path={setBip44Path}
                  setZip32Path={setZip32Path}
                  passphrase={bip39Passphrase}
                  setPassphrase={setBip39Passphrase}
                />
              </AdvancedOptions>
            ))}
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
