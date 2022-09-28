import React, { useState } from "react";

import { Input, InputVariants } from "@anoma/components";
import { Button, ButtonVariant } from "@anoma/components";
import { LoginContainer } from "./Login.components";

enum Status {
  Pending,
  Failed,
  Completed,
}

const Login: React.FC = () => {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>();

  const validateForm = () => {
    return password.length > 0;
  };

  const handleSubmit = () => {};

  return (
    <LoginContainer>
      <Input label="Enter your password" variant={InputVariants.Password} />
      <Button variant={ButtonVariant.Contained} disabled={password.length > 0}>
        Unlock
      </Button>
    </LoginContainer>
  );
};

export default Login;
