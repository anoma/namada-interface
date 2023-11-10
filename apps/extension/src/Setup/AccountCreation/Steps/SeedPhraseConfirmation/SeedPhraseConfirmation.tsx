import { useEffect, useState } from "react";

import { ActionButton, Heading, Input, Stack } from "@namada/components";
import { Password, AccountAlias } from "Setup/Common";
import { Form, HeaderContainer, Subtitle } from "Setup/Setup.components";
import { AccountDetails } from "Setup/types";
import {
  Footer,
  VerifyPanelContainer,
} from "./SeedPhraseConfirmation.components";
import { useNavigate } from "react-router-dom";
import { formatRouterPath } from "@namada/utils";
import { TopLevelRoute } from "App/types";

type SeedPhraseConfirmationProps = {
  seedPhrase: string[];
  passwordRequired: boolean | undefined;
  accountCreationDetails?: AccountDetails;
  onConfirm: (accountCreationDetails: AccountDetails) => void;
};

const SeedPhraseConfirmation = (
  props: SeedPhraseConfirmationProps
): JSX.Element => {
  const navigate = useNavigate();
  const { seedPhrase, passwordRequired, accountCreationDetails, onConfirm } =
    props;

  const [verificationInput1, setVerificationInput1] = useState("");
  const [index1ToConfirm, setIndex1ToConfirm] = useState(-1);
  const [index1Error, setIndex1Error] = useState("");
  const [verificationInput2, setVerificationInput2] = useState("");
  const [index2ToConfirm, setIndex2ToConfirm] = useState(-1);
  const [index2Error, setIndex2Error] = useState("");
  const [password, setPassword] = useState<string | undefined>();
  const [accountName, setAccountName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const seedPhraseLength = seedPhrase.length;
  const notVerified =
    verificationInput1 !== seedPhrase[index1ToConfirm] ||
    verificationInput2 !== seedPhrase[index2ToConfirm] ||
    (passwordRequired && !password) ||
    !accountName;

  const getRandomIndex = (): number =>
    Math.floor(Math.random() * seedPhraseLength);

  useEffect(() => {
    if (seedPhraseLength === 0) {
      navigate(formatRouterPath([TopLevelRoute.Setup]));
      return;
    }

    const index1 = getRandomIndex();
    let index2 = getRandomIndex();
    while (index1 === index2) index2 = getRandomIndex();

    setIndex1ToConfirm(index1);
    setIndex2ToConfirm(index2);
  }, []);

  const verifyWord = (
    word: string,
    userInput: string,
    stateErrorFn: React.Dispatch<React.SetStateAction<string>>
  ): void => {
    if (userInput === "") {
      stateErrorFn(`Required field`);
      return;
    }

    if (word !== userInput) {
      stateErrorFn(`Word doesn't match`);
      return;
    }
    stateErrorFn("");
  };

  const onSubmitForm = (e: React.FormEvent): void => {
    e.preventDefault();
    if (notVerified || isSubmitting) return;

    setIsSubmitting(true);
    const accountCreationDetailsToSubmit: AccountDetails = {
      ...accountCreationDetails,
      alias: accountName,
      password,
    };
    onConfirm(accountCreationDetailsToSubmit);
  };

  return (
    <>
      <HeaderContainer>
        <Heading uppercase level="h1" size="3xl">
          Verify your seed phrase
        </Heading>
        <Subtitle>fill out the words according to their numbers</Subtitle>
      </HeaderContainer>
      <Form onSubmit={onSubmitForm}>
        <Stack gap={5}>
          <VerifyPanelContainer>
            <Input
              label={`Word #${index1ToConfirm + 1}`}
              value={verificationInput1}
              error={index1Error}
              onBlur={() => {
                verifyWord(
                  seedPhrase[index1ToConfirm],
                  verificationInput1,
                  setIndex1Error
                );
              }}
              onChange={(event) => {
                setVerificationInput1(event.target.value);
              }}
            />
            <Input
              label={`Word #${index2ToConfirm + 1}`}
              value={verificationInput2}
              error={index2Error}
              onBlur={() => {
                verifyWord(
                  seedPhrase[index2ToConfirm],
                  verificationInput2,
                  setIndex2Error
                );
              }}
              onChange={(event) => {
                setVerificationInput2(event.target.value);
              }}
            />
          </VerifyPanelContainer>
          <AccountAlias value={accountName} onChange={setAccountName} />
          {passwordRequired && <Password onValidPassword={setPassword} />}
        </Stack>
        <Footer>
          <ActionButton disabled={notVerified}>Next</ActionButton>
        </Footer>
      </Form>
    </>
  );
};

export default SeedPhraseConfirmation;
