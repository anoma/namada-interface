import React from "react";
import { Mnemonic, MnemonicLength } from "@anoma-apps/seed-management";
import { Button, ButtonVariant } from "components/Button";
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
  CopyToClipboard,
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

type AccountInformationViewProps = {
  // read in the parent why we do this
  onCtaHover: () => void;
  // go to next screen
  onConfirmSavingOfSeedPhrase: (seedPhraseAsArray: string[]) => void;
  // depending if first load this might or might not be available
  accountCreationDetails?: AccountCreationDetails;
  // depending if first load this might or might not be available
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

  const defaultSeedPhraseAsString = defaultSeedPhrase?.join(" ");
  const [seedPhrase, setSeedPhrase] = React.useState(
    defaultSeedPhraseAsString || ""
  );

  const seedPhraseAsArray = seedPhraseStringToArray(seedPhrase);
  const isSubmitButtonDisabled = seedPhraseAsArray.length === 0;
  const { seedPhraseLength = "12" } = accountCreationDetails || {};

  React.useEffect(() => {
    // if a mnemonic was passed in we do not generate it again
    if (defaultSeedPhrase?.length && defaultSeedPhrase?.length > 0) return;

    const createMnemonic = async (): Promise<void> => {
      const mnemonic = await Mnemonic.fromMnemonic(
        mnemonicLengthToEnum(seedPhraseLength)
      );
      setSeedPhrase(mnemonic.phrase);
    };

    createMnemonic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountInformationViewContainer>
      {/* header */}
      <AccountInformationViewUpperPartContainer>
        <Header1>Seed Phrase</Header1>
      </AccountInformationViewUpperPartContainer>

      {/* form */}
      <AccountInformationForm>
        {/* description */}
        <BodyText>Write down your seed phrase.</BodyText>
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
          {/* copy seed phrase */}
          <CopyToClipboard
            onClick={() => {
              textToClipboard(seedPhraseAsArray.join(","));
            }}
            href="#"
          >
            Copy to clipboard
          </CopyToClipboard>
        </ExportSeedPhraseButtonsContainer>

        {/* continue */}
        <ButtonContainer>
          <Button
            onClick={() => {
              onConfirmSavingOfSeedPhrase(seedPhraseAsArray);
            }}
            disabled={isSubmitButtonDisabled}
            variant={ButtonVariant.Contained}
          >
            I wrote down my mnemonic
          </Button>
        </ButtonContainer>
      </AccountInformationForm>
    </AccountInformationViewContainer>
  );
};

export default SeedPhrase;
