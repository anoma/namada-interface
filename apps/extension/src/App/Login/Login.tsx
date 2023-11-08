import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Alert,
  Image,
  ImageName,
  Input,
  InputVariants,
  Stack,
} from "@namada/components";

import { TopLevelRoute } from "App/types";
import { UnlockVaultMsg } from "background/vault";
import { ExtensionRequester } from "extension";
import { useQuery } from "hooks";
import { Ports } from "router";
import { LoginContainer, LogoContainer } from "./Login.components";

enum Status {
  InvalidPassword,
  Pending,
  Failed,
}

type Props = {
  requester: ExtensionRequester;
};

const Login: React.FC<Props> = ({ requester }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>();

  const query = useQuery();
  const redirect = query.get("redirect") || TopLevelRoute.Accounts;
  const prompt = query.get("prompt");

  const handleSubmit = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      const unlocked = await requester.sendMessage(
        Ports.Background,
        new UnlockVaultMsg(password)
      );

      if (unlocked) {
        navigate(redirect);
      } else {
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
    <LoginContainer>
      {prompt && <Alert type="info">{prompt}</Alert>}
      <Stack gap={8} as="form" onSubmit={handleSubmit}>
        <LogoContainer>
          <Image imageName={ImageName.LogoMinimal} />
        </LogoContainer>
        <Input
          label="Enter your password"
          autoFocus={true}
          placeholder="Password"
          variant={InputVariants.Password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
        />
        <ActionButton
          disabled={status === Status.Pending || !(password.length > 0)}
        >
          Unlock
        </ActionButton>
      </Stack>
    </LoginContainer>
  );
};

export default Login;
