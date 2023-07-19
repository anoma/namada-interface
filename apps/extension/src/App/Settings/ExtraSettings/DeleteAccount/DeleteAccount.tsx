import { useState } from "react";
import {
  Button,
  ButtonVariant
} from "@namada/components";
import zxcvbn, { ZXCVBNFeedback } from "zxcvbn";

import {
  Input,
  InputContainer,
  InputFeedback,
  Header5,
  ErrorFeedback,
} from "./DeleteAccount.components";

import { DeleteAccountMsg } from "background/keyring";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DeleteAccountError } from "background/keyring/types";
import { assertNever } from "@namada/utils";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed
};

export type Props = {
  accountId: string,
  requester: ExtensionRequester,
  onDeleteAccount: (id: string) => void
};

const DeleteAccount: React.FC<Props> = ({
  accountId,
  requester,
  onDeleteAccount,
}) => {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");

  const shouldDisableSubmit = status === Status.Pending || !password;

  const handleSubmit = async () => {
    setStatus(Status.Pending);

    const result = await requester.sendMessage<DeleteAccountMsg>(
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
  };

  return (
    <>
      {status !== Status.Complete && (
        <>
          <InputContainer>
            <Header5>Password</Header5>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </InputContainer>

          {errorMessage && (
            <ErrorFeedback>{errorMessage}</ErrorFeedback>
          )}

          <Button
            variant={ButtonVariant.Contained}
            onClick={handleSubmit}
            disabled={shouldDisableSubmit}
          >
            {status === Status.Pending ?
              "Pending..." :
              "Delete account"}
          </Button>
        </>
      )}

      {status === Status.Complete && (
        <p>Complete!</p>
      )}
    </>
  );
}

export default DeleteAccount;
