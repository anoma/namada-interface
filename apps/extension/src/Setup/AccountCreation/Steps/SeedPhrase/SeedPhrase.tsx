import React, { useEffect, useState } from "react";

import { Button, ButtonVariant, Toggle } from "@anoma/components";
import { executeUntil } from "@anoma/utils";

import { GenerateMnemonicMsg } from "background/keyring";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  BodyText,
  ButtonsContainer,
  FormContainer,
  Header1,
  SeedPhraseLength,
  SeedPhraseLengthContainer,
  SubViewContainer,
  UpperContentContainer,
} from "Setup/Setup.components";
import {
  SeedPhraseCard,
  SeedPhraseContainer,
  SeedPhraseIndexLabel,
  ExportSeedPhraseButtonsContainer,
  CopyToClipboard,
} from "./SeedPhrase.components";
import { AccountDetails } from "Setup/types";

type Props = {
  requester: ExtensionRequester;
  // go to next screen
  onConfirm: (seedPhraseAsArray: string[]) => void;
  // depending if first load this might or might not be available
  accountCreationDetails?: AccountDetails;
  // depending if first load this might or might not be available
  defaultSeedPhrase?: string[];
};

// saves the content to clipboard
const textToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

const SeedPhrase: React.FC<Props> = (props) => {
  const { requester, onConfirm, defaultSeedPhrase } = props;
  const [seedPhrase, setSeedPhrase] = useState(defaultSeedPhrase || []);

  const isSubmitButtonDisabled = seedPhrase.length === 0;

  const [mnemonicLength, setMnemonicLength] = useState(12);

  useEffect(() => {
    // if a mnemonic was passed in we do not generate it again
    if (defaultSeedPhrase?.length && defaultSeedPhrase?.length > 0) return;

    executeUntil(
      async (): Promise<boolean> => {
        try {
          const words = await requester.sendMessage<GenerateMnemonicMsg>(
            Ports.Background,
            new GenerateMnemonicMsg(mnemonicLength)
          );
          setSeedPhrase(words);
          return true;
        } catch (_) {
          return false;
        }
      },
      { tries: 10, ms: 100 }
    );
  }, [mnemonicLength]);

  return (
    <SubViewContainer>
      {/* header */}
      <UpperContentContainer>
        <Header1>Seed Phrase</Header1>
      </UpperContentContainer>

      {/* form */}
      <FormContainer>
        {/* description */}
        <BodyText>Write down your seed phrase.</BodyText>
        <BodyText>
          WARNING! It is not recommended to screenshot your seed phrase.
        </BodyText>
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
        <SeedPhraseContainer>
          {seedPhrase.map((word, index) => {
            return (
              <SeedPhraseCard key={`${word}:${index}`}>
                <SeedPhraseIndexLabel>{`${index + 1}`}</SeedPhraseIndexLabel>
                {`${word}`}
              </SeedPhraseCard>
            );
          })}
        </SeedPhraseContainer>
        {/* copy seed phrase */}
        {process.env.NODE_ENV === "development" && (
          <ExportSeedPhraseButtonsContainer>
            <CopyToClipboard
              onClick={(e) => {
                e.preventDefault();
                textToClipboard(seedPhrase.join(" "));
              }}
              href="#"
            >
              Copy to clipboard
            </CopyToClipboard>
          </ExportSeedPhraseButtonsContainer>
        )}
        {/* continue */}
        <ButtonsContainer>
          <Button
            onClick={() => {
              onConfirm(seedPhrase);
            }}
            disabled={isSubmitButtonDisabled}
            variant={ButtonVariant.Contained}
          >
            I wrote down my mnemonic
          </Button>
        </ButtonsContainer>
      </FormContainer>
    </SubViewContainer>
  );
};

export default SeedPhrase;
