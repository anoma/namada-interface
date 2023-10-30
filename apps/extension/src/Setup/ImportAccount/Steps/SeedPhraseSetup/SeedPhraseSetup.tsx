import { useEffect, useState } from "react";

import { ActionButton, Heading, Stack } from "@namada/components";
import { Password } from "Setup/Common";
import { Form, HeaderContainer } from "Setup/Setup.components";
import { AccountDetails } from "Setup/types";
import { useNavigate } from "react-router-dom";
import { formatRouterPath } from "@namada/utils";
import { TopLevelRoute } from "App/types";
import { Footer } from "./SeedPhraseSetup.components";

type SeedPhraseSetupProps = {
  seedPhrase?: string[];
  accountCreationDetails?: AccountDetails;
  onConfirm: (accountCreationDetails: AccountDetails) => void;
};

const SeedPhraseSetup = (props: SeedPhraseSetupProps): JSX.Element => {
  const navigate = useNavigate();
  const { seedPhrase, accountCreationDetails, onConfirm } = props;

  const [password, setPassword] = useState<string | null>(null);
  const [keysName, setKeysName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const seedPhraseLength = seedPhrase ? seedPhrase.length : 0;
  const notVerified = !password || !keysName;

  useEffect(() => {
    if (seedPhraseLength === 0) {
      navigate(formatRouterPath([TopLevelRoute.AddAccount]));
      return;
    }
  }, []);

  const onSubmitForm = (e: React.FormEvent): void => {
    e.preventDefault();
    if (notVerified || isSubmitting) return;

    setIsSubmitting(true);
    const accountCreationDetailsToSubmit: AccountDetails = {
      ...accountCreationDetails,
      alias: keysName,
      password,
    };
    onConfirm(accountCreationDetailsToSubmit);
  };

  return (
    <>
      <HeaderContainer>
        <Heading level="h1" size="3xl">
          Set up your imported keys
        </Heading>
      </HeaderContainer>
      <Form onSubmit={onSubmitForm}>
        <Stack gap={5}>
          <Password
            keysName={keysName}
            onChangeKeysName={setKeysName}
            onValidPassword={setPassword}
          />
        </Stack>
        <Footer>
          <ActionButton disabled={notVerified}>Next</ActionButton>
        </Footer>
      </Form>
    </>
  );
};

export default SeedPhraseSetup;
