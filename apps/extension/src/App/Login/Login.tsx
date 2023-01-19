import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { UnlockKeyRingMsg, KeyRingStatus } from "background/keyring";
import { Input, InputVariant } from "@anoma/components";
import { Button, ButtonVariant } from "@anoma/components";
import { LoginContainer, LoginError } from "./Login.components";

enum Status {
  InvalidPassword,
  Pending,
  Failed,
}

type Props = {
  requester: ExtensionRequester;
  route?: TopLevelRoute;
};

const Login: React.FC<Props> = ({
  requester,
  route = TopLevelRoute.Accounts,
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>();

  const handleSubmit = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      const { status: lockStatus } = await requester.sendMessage(
        Ports.Background,
        new UnlockKeyRingMsg(password)
      );
      if (lockStatus === KeyRingStatus.Unlocked) {
        navigate(route);
      } else {
        setStatus(Status.InvalidPassword);
      }
    } catch (e) {
      console.error(e);
      setStatus(Status.Failed);
    }
  };

  return (
    <LoginContainer
      onKeyDown={(e) => {
        if (e.key === "Enter" && password.length > 0) {
          handleSubmit();
        }
      }}
    >
      <Input
        label="Enter your password"
        autoFocus={true}
        variant={InputVariant.Password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant={ButtonVariant.Contained}
        disabled={status === Status.Pending || !(password.length > 0)}
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
