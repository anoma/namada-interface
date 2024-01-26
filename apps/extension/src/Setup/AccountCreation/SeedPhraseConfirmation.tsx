import { useEffect, useState } from "react";

import {
  ActionButton,
  GapPatterns,
  Heading,
  Input,
  Stack,
} from "@namada/components";
import { formatRouterPath } from "@namada/utils";
import { TopLevelRoute } from "App/types";
import { AccountAlias, Password } from "Setup/Common";
import { AccountDetails } from "Setup/types";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

type SeedPhraseConfirmationProps = {
  seedPhrase: string[];
  passwordRequired: boolean | undefined;
  accountCreationDetails?: AccountDetails;
  onConfirm: (accountCreationDetails: AccountDetails) => void;
};

export const SeedPhraseConfirmation = (
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

    setIndex1ToConfirm(Math.min(index1, index2));
    setIndex2ToConfirm(Math.max(index1, index2));
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
      <hgroup className="text-white mb-6 -mt-2 text-center">
        <Heading className="uppercase text-3xl" level="h1">
          Verify your seed phrase
        </Heading>
        <p className="text-white text-base my-1 mx-auto max-w-[90%] text-center font-medium">
          fill out the words according to their numbers
        </p>
      </hgroup>
      <Stack gap={8} as="form" onSubmit={onSubmitForm}>
        <Stack gap={GapPatterns.FormFields}>
          <div
            className={clsx(
              "bg-[#212121] grid grid-cols-2 justify-center rounded-md pt-4 px-17 pb-7 gap-9"
            )}
          >
            <Input
              data-testid="setup-seed-phrase-verification-1-input"
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
              data-testid="setup-seed-phrase-verification-2-input"
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
          </div>
          <AccountAlias
            data-testid="setup-seed-phrase-alias-input"
            value={accountName}
            onChange={setAccountName}
          />
          {passwordRequired && (
            <Password
              data-testid="setup-seed-phrase-pwd-input"
              onValidPassword={setPassword}
            />
          )}
        </Stack>
        <ActionButton
          data-testid="setup-seed-phrase-verification-next-btn"
          disabled={notVerified}
        >
          Next
        </ActionButton>
      </Stack>
    </>
  );
};
