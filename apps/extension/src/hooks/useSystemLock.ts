import { useEventListener } from "@namada/hooks";
import { Events } from "@namada/types";
import {
  CheckIsLockedMsg,
  LockVaultMsg,
  UnlockVaultMsg,
} from "background/vault";
import { useEffect, useState } from "react";
import { Ports } from "router";
import { useRequester } from "./useRequester";

type SystemLockHookOutput = {
  isLocked: boolean | undefined;
  lock: () => void;
  unlock: (password: string) => Promise<boolean>;
};

export const useSystemLock = (): SystemLockHookOutput => {
  const requester = useRequester();
  const [isLocked, setLocked] = useState<undefined | boolean>();

  const queryIsLocked = async (): Promise<void> => {
    setLocked(
      await requester.sendMessage(Ports.Background, new CheckIsLockedMsg())
    );
  };

  const unlock = async (password: string): Promise<boolean> => {
    const unlocked = await requester.sendMessage(
      Ports.Background,
      new UnlockVaultMsg(password)
    );
    if (unlocked) {
      setLocked(!unlocked);
    }
    return unlocked;
  };

  const lock = async (): Promise<void> => {
    await requester.sendMessage(Ports.Background, new LockVaultMsg());
    setLocked(true);
  };

  useEventListener(Events.ExtensionLocked, () => {
    setLocked(true);
  });

  useEffect(() => {
    queryIsLocked();
  }, []);

  return {
    isLocked,
    lock,
    unlock,
  };
};
