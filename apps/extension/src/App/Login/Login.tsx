import React, { useState } from "react";

import {
  ActionButton,
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
    errorMessage = "An error has occurred";
  }

  if (status === Status.InvalidPassword) {
    errorMessage = "Incorrect Password";
  }

  return (
    <Stack gap={6} as="form" onSubmit={handleSubmit}>
      <Heading>Please type in your password to process</Heading>
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
  );
};
