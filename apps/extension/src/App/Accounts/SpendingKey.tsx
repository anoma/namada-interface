import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  Stack,
} from "@namada/components";
import { PageHeader } from "App/Common";
import { RevealSpendingKeyMsg } from "background/keyring";
import { useVaultContext } from "context";
import { useRequester } from "hooks/useRequester";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";

type SpendingKeyParams = {
  accountId: string;
};

export const SpendingKey = (): JSX.Element => {
  const navigate = useNavigate();
  const requester = useRequester();
  const { checkPassword } = useVaultContext();
  const { accountId } = useParams<SpendingKeyParams>();
  const [password, setPassword] = useState<string>();
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [spendingKey, setSpendingKey] = useState<string>();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!password) {
      return;
    }

    const isValidPassword = await checkPassword(password);

    if (!accountId) {
      throw new Error("Invalid account id");
    }

    setPasswordChecked(isValidPassword);

    if (isValidPassword) {
      const response = await requester.sendMessage(
        Ports.Background,
        new RevealSpendingKeyMsg(accountId)
      );
      if (response) {
        setSpendingKey(response);
      }
      return;
    }

    setPasswordError("Invalid password");
  };

  return (
    <>
      <Stack
        full
        as="form"
        gap={GapPatterns.TitleContent}
        onSubmit={handleSubmit}
      >
        <PageHeader title="Spending Key" />
        {!passwordChecked && (
          <>
            <Stack className="mt-12" full gap={GapPatterns.FormFields}>
              <Alert type="info">
                Please provide your password in order to view your spending key
              </Alert>
              <Input
                autoFocus
                variant="Password"
                label="Password"
                placeholder="Password"
                error={passwordError}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Stack>
            <ActionButton type="submit" size="md" disabled={!password}>
              Proceed
            </ActionButton>
          </>
        )}

        {passwordChecked && (
          <>
            <Stack className="flex-1 justify-center" full gap={1}>
              <div className="text-sm -mt-1.5"></div>
              <p className="text-white">
                Your spending key grants the holder the ability to spend funds
                from your shielded account. This must be kept secret!
              </p>
              <Input
                label="Spending Key"
                variant="ReadOnlyCopyText"
                readOnly={true}
                rows={10}
                valueToDisplay={spendingKey}
                value={spendingKey}
                theme="secondary"
                className="pb-20 [&_textarea]:py-2"
              />{" "}
            </Stack>
            <ActionButton size="md" onClick={() => navigate(-1)}>
              Close
            </ActionButton>
          </>
        )}
      </Stack>
    </>
  );
};
