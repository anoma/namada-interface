import { useState } from "react";
import {
  Button,
  ButtonVariant
} from "@anoma/components";
import zxcvbn, { ZXCVBNFeedback } from "zxcvbn";

import {
  Input,
  InputContainer,
  InputFeedback,
  Header5,
  ErrorFeedback,
} from "./ResetPassword.components";

import { ResetPasswordMsg } from "background/keyring";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { ResetPasswordError } from "background/keyring/types";
import { assertNever } from "@anoma/utils";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed
};

export type Props = {
  accountId: string,
  requester: ExtensionRequester
};

const ResetPassword: React.FC<Props> = ({ accountId, requester }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [status, setStatus] = useState<Status>(Status.Unsubmitted);

  const [errorMessage, setErrorMessage] = useState("");

  const match = newPassword === confirmNewPassword;
  const { feedback } = zxcvbn(newPassword);
  const hasFeedback = feedback.warning !== "" ||
    feedback.suggestions.length > 0;

  const shouldDisableSubmit =
    status === Status.Pending ||
    !currentPassword ||
    !newPassword ||
    !match ||
    (process.env.NODE_ENV !== "development" && hasFeedback);

  const handleSubmit = async () => {
    setStatus(Status.Pending);

    const result = await requester.sendMessage<ResetPasswordMsg>(
      Ports.Background,
      new ResetPasswordMsg(currentPassword, newPassword, accountId)
    );

    if (result.ok) {
      setStatus(Status.Complete);
    } else {
      setStatus(Status.Failed);

      switch (result.error) {
        case ResetPasswordError.BadPassword:
          setErrorMessage("Current password is incorrect!");
          break;
        case ResetPasswordError.KeyStoreError:
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
            <Header5>Current password</Header5>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </InputContainer>

          <InputContainer className="long">
            <Header5>New password</Header5>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />

            <InputFeedback className="warning">
              {feedback.warning}
            </InputFeedback>

            {feedback.suggestions.map((suggestion, i) =>
              <InputFeedback key={i}>{suggestion}</InputFeedback>
            )}
          </InputContainer>

          <InputContainer className="medium">
            <Header5>Confirm new password</Header5>
            <Input
              type="password"
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
            />

            {!match && (
              <InputFeedback>Passwords do not match</InputFeedback>
            )}
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
              "Reset password"}
          </Button>
        </>
      )}

      {status === Status.Complete && (
        <p>Complete!</p>
      )}
    </>
  );
}

export default ResetPassword;
