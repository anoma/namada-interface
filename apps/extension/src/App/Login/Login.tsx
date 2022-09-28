import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { UnlockKeyRingMsg } from "background/keyring";
import { Input, InputVariants } from "@anoma/components";
import { Button, ButtonVariant } from "@anoma/components";
import { LoginContainer, LoginError } from "./Login.components";

enum Status {
  InvalidPassword,
  Pending,
  Failed,
  Completed,
}

type Props = {
  requester: ExtensionRequester;
};

const Login: React.FC<Props> = ({ requester }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>();

  const handleSubmit = async () => {
    try {
      setStatus(Status.Pending);
      const isAuthenticated = await requester.sendMessage(
        Ports.Background,
        new UnlockKeyRingMsg(password)
      );
      if (isAuthenticated) {
        navigate(TopLevelRoute.Accounts);
      } else {
        setStatus(Status.InvalidPassword);
      }
    } catch (e) {
      console.error(e);
      setStatus(Status.Failed);
    } finally {
      setStatus(Status.Completed);
    }
  };

  return (
    <LoginContainer>
      <Input
        label="Enter your password"
        variant={InputVariants.Password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant={ButtonVariant.Contained}
        disabled={!(password.length > 0)}
        onClick={handleSubmit}
      >
        Unlock
      </Button>
      {status === Status.Failed && (
        <LoginError>An error has occured!</LoginError>
      )}
      {status === Status.InvalidPassword && (
        <LoginError>Incorrect password!</LoginError>
      )}
    </LoginContainer>
  );
};

export default Login;
