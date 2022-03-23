import { useContext, useEffect, useState } from "react";
import { LOCAL_STORAGE_MASTER_SEED_VALUE, TopLevelRoute } from "App/types";
import { LoginViewContainer } from "./Login.components";
import { useNavigate } from "react-router-dom";
import { Input, InputVariants } from "components/Input";
import { AnomaClient } from "@anoma-apps/anoma-lib";
import { fromBase64 } from "@cosmjs/encoding";
import { Button, ButtonVariant } from "components/Button";
import { AppContext } from "App/App";

const getSeedStorageValue = (): string => {
  return window.localStorage.getItem(LOCAL_STORAGE_MASTER_SEED_VALUE) || "";
};

const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const context = useContext(AppContext);

  const { updatePassword, updateSeed } = context || {};

  useEffect(() => {
    const encrypted = getSeedStorageValue();
    if (!encrypted) {
      return navigate(TopLevelRoute.AccountCreation);
    }
  }, [navigate]);

  const handleUnlockClick = async (): Promise<void> => {
    const { mnemonic } = await new AnomaClient().init();
    const encrypted = getSeedStorageValue();

    try {
      const wasmMnemonic = mnemonic.from_encrypted(
        fromBase64(encrypted),
        password
      );
      const phrase = wasmMnemonic.phrase();
      setError(undefined);

      // This won't work. We need to somehow get phrase and password into
      // the context of the wallet
      const options = {
        state: {
          phrase,
          password,
        },
      };

      if (updatePassword && updateSeed) {
        updatePassword(password);
        updateSeed(phrase);
      }
      navigate(TopLevelRoute.Wallet, options);
    } catch (e) {
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
      <Button variant={ButtonVariant.Contained} onClick={handleUnlockClick}>
        Unlock Wallet
      </Button>
    </LoginViewContainer>
  );
};

export default Login;
