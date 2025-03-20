import React, { useState } from "react";

import {
  ActionButton,
  GapPatterns,
  Heading,
  Image,
  Input,
  LinkButton,
  Stack,
  Text,
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
    <Stack
      as="form"
      className="py-6"
      gap={GapPatterns.TitleContent}
      onSubmit={handleSubmit}
      full
    >
      <div className="mt-6 mb-2">
        <Image
          styleOverrides={{
            flex: 1,
            width: "220px",
            margin: "0 auto",
          }}
          imageName="LogoMinimal"
        />
      </div>
      <Stack gap={2} full>
        <Heading className="text-lg text-center text-white">
          Enter your password
        </Heading>
        <Input
          autoFocus={true}
          placeholder="Password"
          variant="Password"
          value={password}
          disabled={status === Status.Pending}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
        />
        <LinkButton
          href="https://www.namada.help/faq"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Text className="text-center text-neutral-400">
            Forgot your password?
          </Text>
        </LinkButton>
      </Stack>
      <ActionButton
        disabled={status === Status.Pending || !(password.length > 0)}
      >
        Unlock
      </ActionButton>
    </Stack>
  );
};
