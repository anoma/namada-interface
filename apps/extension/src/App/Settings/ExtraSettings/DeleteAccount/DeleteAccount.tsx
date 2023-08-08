import { useCallback, useState } from "react";

import { Button, ButtonVariant } from "@namada/components";
import { assertNever } from "@namada/utils";
import { AccountType } from "@namada/types";

import {
  Input,
  InputContainer,
  Header5,
  ErrorFeedback,
} from "./DeleteAccount.components";
import { DeleteAccountMsg } from "background/keyring";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DeleteAccountError, ParentAccount } from "background/keyring/types";
import { DeleteLedgerAccountMsg } from "background/ledger";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

export type Props = {
  accountId: string;
  accountType: ParentAccount;
  requester: ExtensionRequester;
  onDeleteAccount: (id: string) => void;
};

const DeleteAccount: React.FC<Props> = ({
  accountId,
  accountType,
  requester,
  onDeleteAccount,
}) => {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");

  const shouldDisableSubmit =
    status === Status.Pending ||
    (accountType !== AccountType.Ledger && !password);

  const handleSubmit = useCallback(async (): Promise<void> => {
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
      onDeleteAccount(accountId);
    } else {
      setStatus(Status.Failed);

      switch (result.error) {
        case DeleteAccountError.BadPassword:
          setErrorMessage("Current password is incorrect!");
          break;
        case DeleteAccountError.KeyStoreError:
          setErrorMessage("Unknown error");
          break;
        default:
          assertNever(result.error);
      }
    }
  }, [accountId, password]);

  return (
    <>
      {status !== Status.Complete && (
        <>
          {accountType !== AccountType.Ledger && (
            <InputContainer>
              <Header5>Password</Header5>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputContainer>
          )}

          {errorMessage && <ErrorFeedback>{errorMessage}</ErrorFeedback>}

          <Button
            variant={ButtonVariant.Contained}
            onClick={handleSubmit}
            disabled={shouldDisableSubmit}
          >
            {status === Status.Pending ? "Pending..." : "Delete account"}
          </Button>
        </>
      )}

      {status === Status.Complete && <p>Complete!</p>}
    </>
  );
};

export default DeleteAccount;
