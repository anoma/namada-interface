import {
  ActionButton,
  Alert,
  GapPatterns,
  Heading,
  Input,
  InputVariants,
  Stack,
} from "@namada/components";
import React, { useState } from "react";
import zxcvbn from "zxcvbn";

import { ResetPasswordError, ResetPasswordMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";

enum Status {
  Unsubmitted,
  Pending,
  Complete,
  Failed,
}

type ResetPasswordProps = {
  onComplete: () => void;
};

export const ChangePassword = ({
  onComplete,
}: ResetPasswordProps): JSX.Element => {
  const requester = useRequester();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");
  const { feedback } = zxcvbn(newPassword);

  const hasFeedback =
    feedback.warning !== "" || feedback.suggestions.length > 0;
  const match = newPassword === confirmNewPassword;

  const shouldDisableSubmit =
    status === Status.Pending ||
    !currentPassword ||
    !newPassword ||
    !match ||
    (process.env.NODE_ENV !== "development" && hasFeedback);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus(Status.Pending);
    setErrorMessage("");

    try {
      const result = await requester.sendMessage(
        Ports.Background,
        new ResetPasswordMsg(currentPassword, newPassword)
      );

      if (result.ok) {
        setStatus(Status.Complete);
        onComplete();
        return;
      }

      setStatus(Status.Failed);
      if (result.error === ResetPasswordError.BadPassword) {
        setErrorMessage("Current password is incorrect!");
        return;
      }

      setErrorMessage("Unknown error");
    } catch (err) {
      setStatus(Status.Failed);
      setErrorMessage(`${err}`);
    }
  };

  return (
    <Stack gap={GapPatterns.TitleContent}>
      <Heading>Change Password</Heading>
      <Stack as="form" gap={GapPatterns.FormFields} onSubmit={handleSubmit}>
        <Input
          label="Current password"
          variant={InputVariants.Password}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New Password"
          variant={InputVariants.Password}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          hint={feedback.suggestions.join(" ")}
          error={feedback.warning}
        />
        <Input
          label="Confirm new password"
          variant={InputVariants.Password}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          error={
            confirmNewPassword && newPassword && !match
              ? "Passwords do not match"
              : ""
          }
        />
        {errorMessage && <Alert type="error">{errorMessage}</Alert>}
        <ActionButton disabled={shouldDisableSubmit}>Confirm</ActionButton>
      </Stack>
    </Stack>
  );
};
