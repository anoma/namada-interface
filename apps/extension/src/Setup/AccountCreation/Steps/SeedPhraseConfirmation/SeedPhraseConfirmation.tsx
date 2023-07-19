import React, { useEffect, useState } from "react";
import { Button, ButtonVariant, Input, InputVariants } from "@namada/components";

import {
  BodyText,
  ButtonsContainer,
  InputContainer,
  Header1,
  Header5,
  SubViewContainer,
  UpperContentContainer,
  FormContainer,
} from "Setup/Setup.components";

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
      <UpperContentContainer>
        <Header1>Verify Phrase</Header1>
      </UpperContentContainer>

      <FormContainer>
        <Input
          label={`Word #${indexToConfirm + 1}`}
          variant={InputVariants.Text}
          value={verificationInput}
          onChangeCallback={(event) => {
            setVerificationInput(event.target.value);
          }}
        />
      </FormContainer>
      <ButtonsContainer>
        <Button
          onClick={() => {
            onConfirm();
          }}
          disabled={verificationInput !== seedPhrase[indexToConfirm]}
          variant={ButtonVariant.Contained}
        >
          Verify
        </Button>
      </ButtonsContainer>
    </SubViewContainer>
  );
};

export default SeedPhraseConfirmation;
