import React, { useEffect, useState } from "react";

import { ActionButton, Heading, RadioGroup, Stack } from "@namada/components";
import { copyToClipboard } from "@namada/utils";
import { SeedPhraseInstructions, SeedPhraseList } from "Setup/Common";
import { HeaderContainer } from "Setup/Setup.components";
import { AccountDetails } from "Setup/types";
import { GenerateMnemonicMsg } from "background/keyring";
import { Ports } from "router";

import { CopyToClipboard } from "./SeedPhrase.components";
import { useRequester } from "hooks/useRequester";

type Props = {
  // go to next screen
  onConfirm: (seedPhraseAsArray: string[]) => void;
  // depending if first load this might or might not be available
  accountCreationDetails?: AccountDetails;
  // depending if first load this might or might not be available
  defaultSeedPhrase?: string[];
};

const SeedPhrase: React.FC<Props> = (props) => {
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
      {/* header */}
      <HeaderContainer>
        <Heading level="h1" size="3xl">
          New Seed Phrase
        </Heading>
      </HeaderContainer>

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
        <Stack gap={2}>
          <SeedPhraseList
            columns={mnemonicLength === 24 ? 4 : 3}
            words={seedPhrase}
          />
          <CopyToClipboard
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(seedPhrase.join(" "));
            }}
            href="#"
          >
            Copy to clipboard
          </CopyToClipboard>
        </Stack>
        <SeedPhraseInstructions />
      </Stack>

      <ActionButton
        disabled={isSubmitButtonDisabled}
        onClick={() => {
          onConfirm(seedPhrase);
        }}
      >
        Next
      </ActionButton>
    </>
  );
};

export default SeedPhrase;
