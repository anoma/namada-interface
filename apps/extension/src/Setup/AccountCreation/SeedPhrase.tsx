import {
  ActionButton,
  FeedbackButton,
  RadioGroup,
  SeedPhraseInstructions,
  Stack,
} from "@namada/components";
import { copyToClipboard } from "@namada/utils";
import { SeedPhraseList } from "Setup/Common";
import { GenerateMnemonicMsg } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import React, { useEffect, useState } from "react";
import { Ports } from "router";

type Props = {
  // go to next screen
  onConfirm: (seedPhraseAsArray: string[]) => void;
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
      <Stack gap={5}>
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
        <Stack gap={3}>
          <SeedPhraseList
            columns={mnemonicLength === 24 ? 4 : 3}
            words={seedPhrase}
          />
          <FeedbackButton
            className="text-center mx-auto block"
            successMessage="Copied to clipboard"
            errorMessage="Error trying to copy"
            onAction={() => {
              copyToClipboard(seedPhrase.join(" "));
            }}
          >
            Copy to Clipboard
          </FeedbackButton>
          <div className="text-sm">
            <SeedPhraseInstructions />
          </div>
          <ActionButton
            size="lg"
            data-testid="setup-go-to-verification-button"
            disabled={isSubmitButtonDisabled}
            onClick={() => {
              onConfirm(seedPhrase);
            }}
          >
            Next
          </ActionButton>
        </Stack>
      </Stack>
    </>
  );
};
