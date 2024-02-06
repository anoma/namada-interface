import { useEffect, useState } from "react";

import { ActionButton, Stack } from "@namada/components";
import { AccountAlias, Password } from "Setup/Common";
import { AccountDetails } from "Setup/types";
import { AccountSecret } from "background/keyring";
import { useNavigate } from "react-router-dom";

type SeedPhraseSetupProps = {
  accountSecret?: AccountSecret;
  accountCreationDetails?: AccountDetails;
  onConfirm: (accountCreationDetails: AccountDetails) => void;
  passwordRequired: boolean | undefined;
};

export const SeedPhraseSetup = (props: SeedPhraseSetupProps): JSX.Element => {
  const navigate = useNavigate();
  const { accountSecret, accountCreationDetails, onConfirm, passwordRequired } =
    props;

  const [password, setPassword] = useState<string | undefined>();
  const [accountName, setAccountName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notVerified = (passwordRequired && !password) || !accountName;

  useEffect(() => {
    if (!accountSecret) {
      navigate("/");
    }
  }, []);

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
      <form onSubmit={onSubmitForm}>
        <Stack gap={5}>
          <AccountAlias
            data-testid="setup-import-keys-alias-input"
            value={accountName}
            onChange={setAccountName}
          />
          {passwordRequired && (
            <Password
              data-testid="setup-import-keys-pwd-input"
              onValidPassword={setPassword}
            />
          )}
        </Stack>
        <footer className="mt-14">
          <ActionButton
            data-testid="setup-import-keys-next-button"
            disabled={notVerified}
          >
            Next
          </ActionButton>
        </footer>
      </form>
    </>
  );
};
