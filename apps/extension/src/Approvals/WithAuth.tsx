import { Login } from "App/Login";
import { CheckIsLockedMsg, UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { useEffect, useState } from "react";
import { Ports } from "router";

type Props = {
  children: React.ReactNode;
};

export const WithAuth: React.FC<Props> = ({ children }) => {
  const requester = useRequester();
  const [isLocked, setIsLocked] = useState<boolean>();

  useEffect(() => {
    requester
      .sendMessage(Ports.Background, new CheckIsLockedMsg())
      .then((isLocked) => {
        setIsLocked(isLocked);
      });
  }, []);

  const handleOnLogin = async (password: string): Promise<boolean> => {
    try {
      await requester
        .sendMessage(Ports.Background, new UnlockVaultMsg(password))
        .then((response) => console.warn(response));
      const isLocked = await requester.sendMessage(
        Ports.Background,
        new CheckIsLockedMsg()
      );
      setIsLocked(isLocked);
      return !isLocked;
    } catch (e) {
      setIsLocked(true);
    }
    return false;
  };

  return (
    <>
      {isLocked ?
        <Login onLogin={handleOnLogin} />
      : <>{children}</>}
    </>
  );
};
