import React, { useEffect, useState } from "react";

import {
  ActionButton,
  Heading,
  RadioGroup,
  SeedPhraseInstructions,
  Stack,
} from "@namada/components";
import { copyToClipboard } from "@namada/utils";
import { SeedPhraseList } from "Setup/Common";
import { AccountDetails } from "Setup/types";
import { GenerateMnemonicMsg } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";

type Props = {
  // go to next screen
  onConfirm: (seedPhraseAsArray: string[]) => void;
  // depending if first load this might or might not be available
  accountCreationDetails?: AccountDetails;
  // depending if first load this might or might not be available
  defaultSeedPhrase?: string[];
};

export const SeedPhrase: React.FC<Props> = (props) => {
  const { onConfirm, defaultSeedPhrase } = props;

  const [seedPhrase, setSeedPhrase] = useState(defaultSeedPhrase || []);
  const [mnemonicLength, setMnemonicLength] = useState(12);
  const isSubmitButtonDisabled = seedPhrase.length === 0;

  const requester = useRequester();

  useEffect(() => {
    const setPhrase = async (): Promise<void> => {
      const words = await requester.sendMessage<GenerateMnemonicMsg>(
        Ports.Background,
        new GenerateMnemonicMsg(mnemonicLength)
      );
      setSeedPhrase(words);
    };
    setPhrase();
  }, [mnemonicLength]);

  return (
    <>
      <hgroup className="text-white mb-5 -mt-2 text-center">
        <Heading className="text-3xl uppercase" level="h1">
          New Seed Phrase
        </Heading>
      </hgroup>
      <Stack gap={6}>
        <RadioGroup
          id="mnemonicLength"
          groupLabel="Number of seeds"
          value={mnemonicLength.toString()}
          options={[
            { text: "12 words", value: "12" },
            { text: "24 words", value: "24" },
          ]}
          onChange={(value) => setMnemonicLength(Number(value))}
        />
        <Stack gap={1.5} className="-mt-3">
          <SeedPhraseList
            columns={mnemonicLength === 24 ? 4 : 3}
            words={seedPhrase}
          />
          <button
            data-testid="setup-copy-to-clipboard-button"
            className="text-yellow my-2 relative text-center underline active:top-px"
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(seedPhrase.join(" "));
            }}
          >
            Copy to clipboard
          </button>
        </Stack>
        <div className="-mt-2.5 text-sm">
          <SeedPhraseInstructions />
        </div>
        <ActionButton
          data-testid="setup-go-to-verification-button"
          disabled={isSubmitButtonDisabled}
          onClick={() => {
            onConfirm(seedPhrase);
          }}
        >
          Next
        </ActionButton>
      </Stack>
    </>
  );
};
