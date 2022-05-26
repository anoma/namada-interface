import { useEffect, useState } from "react";
import { TopLevelRoute } from "App/types";
import { LoginViewContainer } from "./Login.components";
import { useNavigate } from "react-router-dom";
import { Input, InputVariants } from "components/Input";
import { Button, ButtonVariant } from "components/Button";
import { Session } from "lib";
import { getParams } from "utils/helpers";

type Props = {
  setPassword: (password: string) => void;
  setStore: (password: string) => void;
};

const Login = ({ setPassword, setStore }: Props): JSX.Element => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    const checkMnemonic = async (): Promise<void> => {
      if (!Session.encryptedSeed()) {
        return navigate(TopLevelRoute.AccountCreation);
      }
    };

    checkMnemonic();
  }, [navigate]);

  const handleUnlockClick = async (): Promise<void> => {
    setIsLoggingIn(true);

    try {
      // Will fail if seed cannot be decrypted:
      await Session.getSeed(loginPassword);

      setError(undefined);
      setPassword(loginPassword);
      setStore(loginPassword);

      const redirectUrl = getParams("redirect");
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate(TopLevelRoute.Wallet);
      }
    } catch (e) {
      setIsLoggingIn(false);
      setError(`An error has occured: ${e}`);
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = e.target;
    setLoginPassword(value);
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
        disabled={!loginPassword} // TODO: Improve validation
      >
        Unlock Wallet
      </Button>
      {isLoggingIn && <p>Unlocking wallet...</p>}
    </LoginViewContainer>
  );
};

export default Login;
