import React, { useState } from "react";
import zxcvbn from "zxcvbn";

import {
  ActionButton,
  Alert,
  GapPatterns,
  Input,
  Stack,
} from "@namada/components";
import { PageHeader } from "App/Common";
import { ResetPasswordError } from "background/vault";
import { useVaultContext } from "context";

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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<Status>(Status.Unsubmitted);
  const [errorMessage, setErrorMessage] = useState("");
  const { changePassword } = useVaultContext();
  const { feedback } = zxcvbn(newPassword);

  const hasFeedback =
    feedback.warning !== "" || feedback.suggestions.length > 0;
  const match = newPassword === confirmNewPassword;

  const shouldDisableSubmit =
    status === Status.Pending ||
    !oldPassword ||
    !newPassword ||
    !match ||
    (process.env.NODE_ENV !== "development" && hasFeedback);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus(Status.Pending);
    setErrorMessage("");

    try {
      const result = await changePassword(oldPassword, newPassword);
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
    <Stack
      as="form"
      gap={GapPatterns.TitleContent}
      onSubmit={handleSubmit}
      full
    >
      <PageHeader title="Change Password" />
      <Stack className="justify-center" full gap={GapPatterns.FormFields}>
        <Input
          label="Current password"
          variant="Password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          label="New Password"
          variant="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={
            newPassword.length > 0
              ? feedback.warning || feedback.suggestions.join(" ")
              : ""
          }
        />
        <Input
          label="Confirm new password"
          variant="Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          error={
            confirmNewPassword && newPassword && !match
              ? "Passwords do not match"
              : ""
          }
        />
        {errorMessage && <Alert type="error">{errorMessage}</Alert>}
      </Stack>
      <ActionButton size="lg" disabled={shouldDisableSubmit}>
        Confirm
      </ActionButton>
    </Stack>
  );
};
