import { useEffect, useState } from "react";

import { ActionButton, GapPatterns, Input, Stack } from "@namada/components";
import routes from "Setup/routes";
import { AccountDetails } from "Setup/types";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

type SeedPhraseConfirmationProps = {
  seedPhrase: string[];
  passwordRequired: boolean | undefined;
  accountCreationDetails?: AccountDetails;
  onConfirm: () => void;
};

export const SeedPhraseConfirmation = (
  props: SeedPhraseConfirmationProps
): JSX.Element => {
  const navigate = useNavigate();
  const { seedPhrase } = props;

  const [verificationInput1, setVerificationInput1] = useState<string | null>(
    null
  );
  const [index1ToConfirm, setIndex1ToConfirm] = useState(-1);
  const [index1Error, setIndex1Error] = useState("");
  const [verificationInput2, setVerificationInput2] = useState<string | null>(
    null
  );
  const [index2ToConfirm, setIndex2ToConfirm] = useState(-1);
  const [index2Error, setIndex2Error] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const seedPhraseLength = seedPhrase.length;
  const notVerified =
    verificationInput1 !== seedPhrase[index1ToConfirm] ||
    verificationInput2 !== seedPhrase[index2ToConfirm];

  const getRandomIndex = (): number =>
    Math.floor(Math.random() * seedPhraseLength);

  useEffect(() => {
    if (seedPhraseLength === 0) {
      navigate(routes.start());
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
    props.onConfirm();
  };

  return (
    <>
      <p
        className={clsx(
          "text-white text-base -mt-2 mb-8",
          "mx-auto max-w-[90%] text-center font-medium"
        )}
      >
        fill out the words according to their numbers
      </p>
      <Stack
        className="flex-1 justify-between h-[415px]"
        gap={8}
        as="form"
        onSubmit={onSubmitForm}
      >
        <Stack
          gap={GapPatterns.FormFields}
          className="[&_label]:!text-sm justify-center flex-1"
        >
          <Input
            data-testd="setup-seed-phrase-verification-1-input"
            label={`Word #${index1ToConfirm + 1}`}
            value={verificationInput1 || ""}
            error={index1Error}
            onChange={(event) => {
              setVerificationInput1(event.target.value);
              if (verificationInput1 !== null) {
                verifyWord(
                  seedPhrase[index1ToConfirm],
                  event.target.value,
                  setIndex1Error
                );
              }
            }}
          />
          <Input
            data-testid="setup-seed-phrase-verification-2-input"
            label={`Word #${index2ToConfirm + 1}`}
            value={verificationInput2 || ""}
            error={index2Error}
            onChange={(event) => {
              setVerificationInput2(event.target.value);
              if (verificationInput2) {
                verifyWord(
                  seedPhrase[index2ToConfirm],
                  event.target.value,
                  setIndex2Error
                );
              }
            }}
          />
        </Stack>
        <ActionButton
          size="lg"
          data-testid="setup-seed-phrase-verification-next-btn"
          disabled={notVerified}
        >
          Next
        </ActionButton>
      </Stack>
    </>
  );
};
