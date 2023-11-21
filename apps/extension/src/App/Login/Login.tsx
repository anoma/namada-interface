import React, { useState } from "react";

import {
  ActionButton,
  GapPatterns,
  Heading,
  Input,
  InputVariants,
  Stack,
} from "@namada/components";

enum Status {
  InvalidPassword,
  Pending,
  Failed,
}

type LoginProps = {
  onLogin: (password: string) => Promise<boolean>;
};

export const Login = ({ onLogin }: LoginProps): JSX.Element => {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus(Status.Pending);
    try {
      const unlocked = await onLogin(password);
      if (!unlocked) {
        setStatus(Status.InvalidPassword);
      }
    } catch (e) {
      console.error(e);
      setStatus(Status.Failed);
    }
  };

  let errorMessage = "";
  if (status === Status.Failed) {
    errorMessage = "An error has occurred Rlrasdasd";
  }

  if (status === Status.InvalidPassword) {
    errorMessage = "Incorrect Password";
  }

  return (
    <Stack gap={GapPatterns.TitleContent}>
      <Heading>Please type in your password to unlock</Heading>
      <Stack gap={GapPatterns.FormFields} as="form" onSubmit={handleSubmit}>
        <Input
          label="Enter your password"
          autoFocus={true}
          placeholder="Password"
          variant={InputVariants.Password}
          value={password}
          disabled={status === Status.Pending}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
        />
        <ActionButton
          disabled={status === Status.Pending || !(password.length > 0)}
        >
          Unlock
        </ActionButton>
      </Stack>
    </Stack>
  );
};
