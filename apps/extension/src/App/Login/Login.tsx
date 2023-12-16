import React, { useState } from "react";

import {
  ActionButton,
  GapPatterns,
  Heading,
  Image,
  Input,
  Stack,
} from "@namada/components";
import { LogoContainer } from "./Login.components";

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
    <Stack
      as="form"
      gap={GapPatterns.TitleContent}
      onSubmit={handleSubmit}
      full
    >
      <LogoContainer>
        <Image
          styleOverrides={{
            flex: 1,
            width: "100%",
            maxWidth: "60%",
            margin: "0 auto",
          }}
          imageName="LogoMinimal"
        />
      </LogoContainer>
      <Stack gap={2} full>
        <Heading className="text-xl">Enter your password to unlock</Heading>
        <Input
          autoFocus={true}
          placeholder="Password"
          variant="Password"
          value={password}
          disabled={status === Status.Pending}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
        />
      </Stack>
      <ActionButton
        disabled={status === Status.Pending || !(password.length > 0)}
      >
        Unlock
      </ActionButton>
    </Stack>
  );
};
