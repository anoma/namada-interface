import React from "react";
import { Button } from "components/Button";
import {
  AccountInformationViewContainer,
  AccountInformationViewUpperPartContainer,
  AccountInformationForm,
  DescriptionAndInputContainer,
  Header1,
  Header5,
  BodyText,
  Input,
  InputContainer,
  ButtonContainer,
} from "./SeedPhraseConfirmation.components";

type SeedPhraseConfirmationProps = {
  seedPhrase: string[];
  onCtaHover: () => void;
  onConfirmSeedPhrase: () => void;
};

function SeedPhraseConfirmation(
  props: SeedPhraseConfirmationProps
): JSX.Element {
  const { seedPhrase, onCtaHover, onConfirmSeedPhrase } = props;
  const seedPhraseLength = seedPhrase.length;
  const [verificationInput, setVerificationInput] = React.useState("");
  const [indexToConfirm, setIndexToConfirm] = React.useState(-1);

  React.useEffect(() => {
    setIndexToConfirm(Math.floor(Math.random() * seedPhraseLength));
  }, []);

  return (
    <AccountInformationViewContainer>
      {/* header */}
      <AccountInformationViewUpperPartContainer>
        <Header1>Verify Phrase</Header1>
      </AccountInformationViewUpperPartContainer>

      {/* form */}
      <AccountInformationForm>
        <DescriptionAndInputContainer>
          {/* description */}
          <BodyText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Enim augue
            aenean facilisi placerat laoreet sem faucibus{" "}
          </BodyText>

          {/* seed verification */}
          <InputContainer>
            <Header5>Word #{indexToConfirm + 1}</Header5>
            <Input
              onChange={(event) => {
                setVerificationInput(event.target.value);
              }}
            />
          </InputContainer>
        </DescriptionAndInputContainer>
        {/* submit */}
        <ButtonContainer>
          <Button
            onClick={() => {
              onConfirmSeedPhrase();
            }}
            disabled={verificationInput !== seedPhrase[indexToConfirm]}
            onHover={onCtaHover}
          >
            Verify
          </Button>
        </ButtonContainer>
      </AccountInformationForm>
    </AccountInformationViewContainer>
  );
}

export default SeedPhraseConfirmation;
