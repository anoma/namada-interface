import { Button, ButtonVariant } from "@namada/components";
import { useState } from "react";
import zxcvbn from "zxcvbn";

import {
  ErrorFeedback,
  Header5,
  Input,
  InputContainer,
  InputFeedback,
} from "./ResetPassword.components";

import { ResetPasswordError, ResetPasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

const ResetPassword: React.FC = () => {
  const requester = useRequester();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");

  const match = newPassword === confirmNewPassword;
  const { feedback } = zxcvbn(newPassword);
  const hasFeedback =
    feedback.warning !== "" || feedback.suggestions.length > 0;

  const shouldDisableSubmit =
    status === Status.Pending ||
    !currentPassword ||
    !newPassword ||
    !match ||
    (process.env.NODE_ENV !== "development" && hasFeedback);

  const handleSubmit = async (): Promise<void> => {
    setStatus(Status.Pending);
    const result = await requester.sendMessage(
      Ports.Background,
      new ResetPasswordMsg(currentPassword, newPassword)
    );

    try {
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
        }
      }
    } catch (err) {
      setStatus(Status.Failed);
      setErrorMessage(`${err}`);
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
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </InputContainer>

          <InputContainer className="long">
            <Header5>New password</Header5>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <InputFeedback className="warning">
              {feedback.warning}
            </InputFeedback>

            {feedback.suggestions.map((suggestion, i) => (
              <InputFeedback key={i}>{suggestion}</InputFeedback>
            ))}
          </InputContainer>

          <InputContainer className="medium">
            <Header5>Confirm new password</Header5>
            <Input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />

            {!match && <InputFeedback>Passwords do not match</InputFeedback>}
          </InputContainer>

          {errorMessage && <ErrorFeedback>{errorMessage}</ErrorFeedback>}

          <Button
            variant={ButtonVariant.Contained}
            onClick={handleSubmit}
            disabled={shouldDisableSubmit}
          >
            {status === Status.Pending ? "Pending..." : "Reset password"}
          </Button>
        </>
      )}

      {status === Status.Complete && <p>Complete!</p>}
    </>
  );
};

export default ResetPassword;
