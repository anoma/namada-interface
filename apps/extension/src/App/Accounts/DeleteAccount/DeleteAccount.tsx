import { useCallback, useContext, useEffect, useState } from "react";

import {
  ActionButton,
  Alert,
  GapPatterns,
  Heading,
  Input,
  InputVariants,
  Loading,
  Stack,
  Text,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { AccountManagementRoute, TopLevelRoute } from "App/types";
import { CheckPasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";
import { AccountContext } from "context";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

export type DeleteAccountLocationState = {
  account?: DerivedAccount;
};

export const DeleteAccount = (): JSX.Element => {
  // TODO: When state is not passed, query by accountId
  const { state }: { state: DeleteAccountLocationState } = useLocation();
  const { accountId = "" } = useParams();
  const { remove: onRemoveAccount } = useContext(AccountContext);

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [loadingState, setLoadingState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const requester = useRequester();
  const accountType = state.account?.type;

  const shouldDisableSubmit =
    status === Status.Pending ||
    (accountType !== AccountType.Ledger && !password);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      try {
        setStatus(Status.Pending);
        setLoadingState("Deleting Key...");

        const verifyPassword = await requester.sendMessage<CheckPasswordMsg>(
          Ports.Background,
          new CheckPasswordMsg(password)
        );

        if (!verifyPassword) {
          setErrorMessage("Password is incorrect");
          setStatus(Status.Failed);
          setLoadingState("");
          return;
        }

        await onRemoveAccount(accountId);
      } catch (error) {
        setLoadingState("");
        setErrorMessage(`${error}`);
        setStatus(Status.Failed);
      }
    },
    [accountId, password]
  );

  useEffect(() => {
    if (!accountId || !state.account) {
      navigate(
        formatRouterPath([
          TopLevelRoute.Accounts,
          AccountManagementRoute.ViewAccounts,
        ])
      );
    }
  }, [accountId, state]);

  return (
    <>
      <Stack as="form" onSubmit={handleSubmit} gap={GapPatterns.TitleContent}>
        <Stack as="header" gap={4}>
          <Heading>Delete Keys</Heading>
          <Alert type="warning" title="Alert!">
            Make sure that you&apos;ve backed up your recovery phrase and
            private key.
          </Alert>
        </Stack>
        <Text>
          After deletion, you will be required to import your seed phrase to
          restore your access to it
        </Text>
        <Input
          label="Password"
          variant={InputVariants.Password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
        />
        <ActionButton disabled={shouldDisableSubmit}>
          Delete Account
        </ActionButton>
      </Stack>
      <Loading variant="full" status={loadingState} visible={!!loadingState} />
    </>
  );
};
