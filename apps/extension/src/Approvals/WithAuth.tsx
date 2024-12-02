import { Login } from "App/Login";
import { UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useContext } from "react";
import { Ports } from "router";
import { ExtensionLockContext } from "./Approvals";

type Props = {
  children: React.ReactNode;
};

export const WithAuth: React.FC<Props> = ({ children }) => {
  const requester = useRequester();
  const { isUnlocked, setIsUnlocked } = useContext(ExtensionLockContext);

  const handleOnLogin = async (password: string): Promise<boolean> => {
    try {
      const isUnlocked = await requester.sendMessage(
        Ports.Background,
        new UnlockVaultMsg(password)
      );
      setIsUnlocked!(isUnlocked);
      return isUnlocked;
    } catch (_) {
      setIsUnlocked!(false);
    }
    return false;
  };

  return (
    <>
      {isUnlocked ?
        <>{children}</>
      : <Login onLogin={handleOnLogin} />}
    </>
  );
};
