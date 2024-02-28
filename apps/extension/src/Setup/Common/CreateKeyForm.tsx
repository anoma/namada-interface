import { ActionButton, Stack } from "@namada/components";
import { AccountDetails } from "Setup/types";
import { useState } from "react";
import { AccountAlias } from "./AccountAlias";
import { Password } from "./Password";

type Props = {
  onConfirm: (accountDetails: AccountDetails) => void;
  accountCreationDetails?: AccountDetails;
  passwordRequired: boolean | undefined;
};

export default function CreateKeyForm({
  onConfirm,
  passwordRequired,
  accountCreationDetails,
}: Props): JSX.Element {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState<string | undefined>("");
  const [isSubmitting, setSubmitting] = useState(false);

  const isValid = (passwordRequired && !password) || !accountName;

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitting(true);
    const accountCreationDetailsToSubmit: AccountDetails = {
      ...accountCreationDetails,
      alias: accountName,
      password,
    };
    onConfirm(accountCreationDetailsToSubmit);
  };

  return (
    <Stack
      as="form"
      gap={1}
      onSubmit={onSubmit}
      className="justify-between h-[490px]"
    >
      <Stack gap={12} className="justify-center flex-1">
        <AccountAlias
          data-testid="setup-seedphrase-alias-input"
          value={accountName}
          onChange={setAccountName}
        />
        {passwordRequired && (
          <Stack gap={4}>
            <Password
              data-testid="setup-seed-phrase-pwd-input"
              onValidPassword={setPassword}
            />
          </Stack>
        )}
      </Stack>
      <ActionButton
        size="lg"
        data-testid="setup-seed-phrase-verification-next-btn"
        disabled={isValid}
      >
        Next
      </ActionButton>
    </Stack>
  );
}
