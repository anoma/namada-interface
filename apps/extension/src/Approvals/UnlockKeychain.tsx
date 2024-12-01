import { Login } from "App/Login";
import { CheckIsLockedMsg, UnlockVaultMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";

export const UnlockKeychain: React.FC = () => {
  const requester = useRequester();

  const handleOnLogin = async (password: string): Promise<boolean> => {
    try {
      await requester.sendMessage(
        Ports.Background,
        new UnlockVaultMsg(password)
      );
      const isLocked = await requester.sendMessage(
        Ports.Background,
        new CheckIsLockedMsg()
      );
      return !isLocked;
    } catch (e) {
      console.error(`${e}`);
    }
    return false;
  };

  return <Login onLogin={handleOnLogin} />;
};
