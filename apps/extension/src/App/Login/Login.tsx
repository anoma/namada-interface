import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, ButtonVariant, Input, InputVariants } from "@namada/components";

import { TopLevelRoute } from "App/types";
import { ExtensionRequester } from "extension";
import { useQuery } from "hooks";
import { Ports } from "router";
import { UnlockKeyRingMsg, KeyRingStatus } from "background/keyring";
import { LoginContainer, LoginError } from "./Login.components";

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
      const { status: lockStatus } = await requester.sendMessage(
        Ports.Background,
        new UnlockKeyRingMsg(password)
      );
      if (lockStatus === KeyRingStatus.Unlocked) {
        navigate(redirect);
      } else {
        setStatus(Status.InvalidPassword);
      }
    } catch (e) {
      console.error(e);
      setStatus(Status.Failed);
    }
  };

  return (
    <>
      {prompt && <p>{prompt}</p>}
      <LoginContainer
        onKeyDown={(e) => {
          if (e.key === "Enter" && password.length > 0) {
            handleSubmit();
          }
        }}
      >
        <Input
          label="Enter password"
          autoFocus={true}
          variant={InputVariants.Password}
          value={password}
          onChangeCallback={(e) => setPassword(e.target.value)}
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
    </>
  );
};

export default Login;
