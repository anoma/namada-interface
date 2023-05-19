import React, { useEffect, useState } from "react";
import { Button, ButtonVariant, Input, InputVariants } from "@anoma/components";

import {
  BodyText,
  ButtonContainer,
  InputContainer,
  Header1,
  Header5,
  SubViewContainer,
  UpperContentContainer,
  FormContainer,
} from "Setup/Setup.components";
import { DescriptionAndInputContainer } from "./SeedPhraseConfirmation.components";
import { ContentContainer } from "App/App.components";

type Props = {
  seedPhrase: string[];
  onConfirm: () => void;
};

const SeedPhraseConfirmation: React.FC<Props> = (props) => {
  const { seedPhrase, onConfirm } = props;
  const seedPhraseLength = seedPhrase.length;
  const [verificationInput, setVerificationInput] = useState("");
  const [indexToConfirm, setIndexToConfirm] = useState(-1);

  useEffect(() => {
    setIndexToConfirm(Math.floor(Math.random() * seedPhraseLength));
  }, []);

  return (
    <SubViewContainer>
      {/* header */}
      <UpperContentContainer>
        <Header1>Verify Phrase</Header1>
      </UpperContentContainer>

      {/* form */}
      <ContentContainer>
        <DescriptionAndInputContainer>
          {/* description */}
          <BodyText> </BodyText>

          {/* seed verification */}
          <InputContainer>
            <Header5></Header5>
            <Input
              label={`Word #${indexToConfirm + 1}`}
              variant={InputVariants.Text}
              value={verificationInput}
              onChangeCallback={(event) => {
                setVerificationInput(event.target.value);
              }}
            />
          </InputContainer>
        </DescriptionAndInputContainer>

        <ButtonContainer>
          <Button
            onClick={() => {
              onConfirm();
            }}
            disabled={verificationInput !== seedPhrase[indexToConfirm]}
            variant={ButtonVariant.Contained}
          >
            Verify
          </Button>
        </ButtonContainer>
      </ContentContainer>
    </SubViewContainer>
  );
};

export default SeedPhraseConfirmation;
