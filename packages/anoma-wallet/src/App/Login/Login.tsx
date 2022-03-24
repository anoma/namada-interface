import { useContext, useEffect, useState } from "react";
import { LOCAL_STORAGE_MASTER_SEED_VALUE, TopLevelRoute } from "App/types";
import { LoginViewContainer } from "./Login.components";
import { useNavigate } from "react-router-dom";
import { Input, InputVariants } from "components/Input";
import { AnomaClient } from "@anoma-apps/anoma-lib";
import { fromBase64 } from "@cosmjs/encoding";
import { Button, ButtonVariant } from "components/Button";
import { AppContext } from "App/App";
import { aesEncrypt } from "utils/helpers";

const { REACT_APP_SECRET_KEY = "" } = process.env;

const getSeedStorageValue = (): string => {
  return window.localStorage.getItem(LOCAL_STORAGE_MASTER_SEED_VALUE) || "";
};

const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const context = useContext(AppContext);

  const {
    setPassword: setPasswordContext,
    setSeed,
    setIsLoggedIn,
  } = context || {};

  useEffect(() => {
    const encrypted = getSeedStorageValue();
    if (!encrypted) {
      return navigate(TopLevelRoute.AccountCreation);
    }
  }, [navigate]);

  const handleUnlockClick = async (): Promise<void> => {
    const { mnemonic } = await new AnomaClient().init();
    const encrypted = getSeedStorageValue();
    setIsLoggingIn(true);

    try {
      const wasmMnemonic = mnemonic.from_encrypted(
        fromBase64(encrypted),
        password
      );
      const phrase = wasmMnemonic.phrase();
      setError(undefined);

      if (setPasswordContext && setSeed && setIsLoggedIn) {
        setPasswordContext(password);
        setSeed(phrase);

        const encrypted = aesEncrypt(password, REACT_APP_SECRET_KEY);
        window.localStorage.setItem("session", encrypted);
        setIsLoggedIn();
      }
      navigate(TopLevelRoute.Wallet);
    } catch (e) {
      setIsLoggingIn(false);
      setError(`An error has occured: ${e}`);
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = e.target;
    setPassword(value);
  };

  return (
    <LoginViewContainer>
      <Input
        label="Enter password to unlock wallet"
        variant={InputVariants.Password}
        onChangeCallback={handlePasswordChange}
        error={error}
      />
      <Button
        variant={ButtonVariant.Contained}
        onClick={handleUnlockClick}
        disabled={!password} // TODO: Improve validation
      >
        Unlock Wallet
      </Button>
      {isLoggingIn && <p>Unlocking wallet...</p>}
    </LoginViewContainer>
  );
};

export default Login;
