import { useCallback, useContext, useEffect, useState } from "react";

import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  Loading,
  Stack,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { CheckPasswordMsg } from "background/vault";
import { AccountContext } from "context";
import { useRequester } from "hooks/useRequester";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";

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
      navigate(routes.viewAccountList());
    }
  }, [accountId, state]);

  return (
    <>
      <Stack
        as="form"
        onSubmit={handleSubmit}
        gap={GapPatterns.TitleContent}
        full
      >
        <Stack gap={GapPatterns.TitleContent} full>
          <Stack as="header" gap={4}>
            <PageHeader title="Delete Keys" />
            <Alert type="warning" title="Alert!">
              Make sure that you&apos;ve backed up your seed phrase and private
              key.
            </Alert>
          </Stack>
          <p className="text-white leading-5 text-base font-medium">
            After deletion, you will be required to import your seed phrase to
            restore your access to it
          </p>
          <Input
            autoFocus
            label="Password"
            variant="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errorMessage}
          />
        </Stack>
        <ActionButton size="lg" disabled={shouldDisableSubmit}>
          Delete Account
        </ActionButton>
      </Stack>
      <Loading
        imageUrl="/assets/images/loading.gif"
        variant="full"
        status={loadingState}
        visible={!!loadingState}
      />
    </>
  );
};
