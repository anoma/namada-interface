import { useCallback, useEffect, useState } from "react";

import {
  ActionButton,
  Alert,
  Heading,
  Input,
  InputVariants,
  Stack,
  Text,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { assertNever } from "@namada/utils";
import { TopLevelRoute } from "App/types";
import { DeleteAccountMsg } from "background/keyring";
import { DeleteAccountError } from "background/keyring/types";
import { DeleteLedgerAccountMsg } from "background/ledger";
import { ExtensionRequester } from "extension";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Ports } from "router";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

export type Props = {
  requester: ExtensionRequester;
  onComplete: () => void;
};

export type DeleteAccountLocationState = {
  account?: DerivedAccount;
};

const DeleteAccount: React.FC<Props> = ({ requester, onComplete }) => {
  // TODO: When state is not passed, query by accountId
  const { state }: { state: DeleteAccountLocationState } = useLocation();
  const { accountId = "" } = useParams();

  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");

  const accountType = state.account?.type;

  const shouldDisableSubmit =
    status === Status.Pending ||
    (accountType !== AccountType.Ledger && !password);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setStatus(Status.Pending);

      const result =
        accountType === AccountType.Ledger
          ? await requester.sendMessage<DeleteLedgerAccountMsg>(
              Ports.Background,
              new DeleteLedgerAccountMsg(accountId)
            )
          : await requester.sendMessage<DeleteAccountMsg>(
              Ports.Background,
              new DeleteAccountMsg(accountId, password)
            );

      if (result.ok) {
        setStatus(Status.Complete);
        onComplete();
      } else {
        setStatus(Status.Failed);

        switch (result.error) {
          case DeleteAccountError.BadPassword:
            setErrorMessage("Password is incorrect");
            break;
          case DeleteAccountError.KeyStoreError:
            setErrorMessage("Unknown error");
            break;
          default:
            assertNever(result.error);
        }
      }
    },
    [accountId, password]
  );

  useEffect(() => {
    if (status === Status.Complete) {
      navigate(TopLevelRoute.Accounts);
    }
  }, [status]);

  useEffect(() => {
    if (!accountId || !state.account) {
      navigate(TopLevelRoute.Accounts);
    }
  }, [accountId, state]);

  return (
    <Stack as="form" onSubmit={handleSubmit} gap={9}>
      <Stack as="header" gap={4}>
        <Heading>Delete Keys</Heading>
        <Alert type="warning" title="Alert!">
          Make sure that you&apos;ve backed up your recovery phrase and private
          key.
        </Alert>
      </Stack>

      <Text>
        After deletion, you will be required to import your seed phrase to
        restore your access to it
      </Text>

      {accountType !== AccountType.Ledger && (
        <Input
          label="Password"
          variant={InputVariants.Password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
        />
      )}
      <ActionButton disabled={shouldDisableSubmit}>Delete Account</ActionButton>
    </Stack>
  );
};

export default DeleteAccount;
