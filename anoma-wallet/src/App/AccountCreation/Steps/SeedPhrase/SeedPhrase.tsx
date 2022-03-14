import React from "react";
import { Mnemonic, MnemonicLength } from "@anoma-wallet/key-management";
import { Button, Variant } from "components/Button";
import {
  AccountInformationViewContainer,
  AccountInformationViewUpperPartContainer,
  AccountInformationForm,
  Header1,
  BodyText,
  ButtonContainer,
  SeedPhraseCard,
  SeedPhraseContainer,
  SeedPhraseIndexLabel,
  ExportSeedPhraseButtonsContainer,
} from "./SeedPhrase.components";

const seedPhraseStringToArray = (seedPhraseAsString: string): string[] => {
  if (seedPhraseAsString === "") return [];
  return seedPhraseAsString.split(" ");
};

// this is being used:
// to store the data in the parent when editing
// when submitting the form
export type AccountCreationDetails = {
  seedPhraseLength?: string;
  accountName?: string;
  password?: string;
};

// the data of this form
type AccountInformationViewProps = {
  onCtaHover: () => void;
  onConfirmSavingOfSeedPhrase: (seedPhraseAsArray: string[]) => void;
  accountCreationDetails?: AccountCreationDetails;
  defaultSeedPhrase?: string[];
};

const mnemonicLengthToEnum = (seedPhraseLength: string): MnemonicLength => {
  switch (seedPhraseLength) {
    case "12":
      return MnemonicLength.Twelve;
    case "24":
      return MnemonicLength.TwentyFour;
    default:
      return MnemonicLength.Twelve;
  }
};

// this starts a download of a file with the passed in content
// TODO: check the security of this, nothing stays in DOM?
const textToDownload = (content: string, filename: string): void => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(content)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// saves the content to clipboard
const textToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

const SeedPhrase = (props: AccountInformationViewProps): JSX.Element => {
  const {
    accountCreationDetails,
    onCtaHover,
    onConfirmSavingOfSeedPhrase,
    defaultSeedPhrase,
  } = props;
  const { seedPhraseLength = "12" } = accountCreationDetails || {};
  const defaultSeedPhraseAsString = defaultSeedPhrase?.join(" ");
  const [seedPhrase, setSeedPhrase] = React.useState(
    defaultSeedPhraseAsString || ""
  );
  const seedPhraseAsArray = seedPhraseStringToArray(seedPhrase);
  const isSubmitButtonDisabled = seedPhraseAsArray.length === 0;

  React.useEffect(() => {
    const createMnemonic = async (): Promise<void> => {
      const mnemonic = await Mnemonic.fromMnemonic(
        mnemonicLengthToEnum(seedPhraseLength)
      );
      setSeedPhrase(mnemonic.value);
    };
    if (defaultSeedPhrase?.length && defaultSeedPhrase?.length > 0) return;
    createMnemonic();
  }, []);

  return (
    <AccountInformationViewContainer>
      {/* header */}
      <AccountInformationViewUpperPartContainer>
        <Header1>Recovery Phrase</Header1>
      </AccountInformationViewUpperPartContainer>

      {/* form */}
      <AccountInformationForm>
        {/* description */}
        <BodyText>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue
          aenean facilisi placerat laoreet sem faucibus{" "}
        </BodyText>
        <SeedPhraseContainer>
          {seedPhraseAsArray.map((seedPhraseWord, index) => {
            return (
              <SeedPhraseCard key={seedPhraseWord}>
                <SeedPhraseIndexLabel>{`${index + 1}`}</SeedPhraseIndexLabel>
                {`${seedPhraseWord}`}
              </SeedPhraseCard>
            );
          })}
        </SeedPhraseContainer>

        <ExportSeedPhraseButtonsContainer>
          {/* download seed phrase */}
          <Button
            onClick={() => {
              textToDownload(
                seedPhraseAsArray
                  .map((word, index) => `${index + 1} ${word}`)
                  .join("\n"),
                "seed_phrase.txt"
              );
            }}
            variant={Variant.text}
          >
            Download backup
          </Button>

          {/* copy seed phrase */}
          <Button
            onClick={() => {
              textToClipboard(seedPhraseAsArray.join(","));
            }}
            variant={Variant.text}
          >
            Copy to clipboard
          </Button>
        </ExportSeedPhraseButtonsContainer>

        {/* continue */}
        <ButtonContainer>
          <Button
            onClick={() => {
              if (!isSubmitButtonDisabled) {
                const accountCreationDetailsToSubmit: AccountCreationDetails = {
                  ...accountCreationDetails,
                };
              }

              onConfirmSavingOfSeedPhrase(seedPhraseAsArray);
            }}
            onHover={onCtaHover}
            disabled={isSubmitButtonDisabled}
          >
            I wrote down my mnemonic
          </Button>
        </ButtonContainer>
      </AccountInformationForm>
    </AccountInformationViewContainer>
  );
};

export default SeedPhrase;
