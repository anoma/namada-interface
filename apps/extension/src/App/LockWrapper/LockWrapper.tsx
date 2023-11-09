import React, { useEffect, useState } from "react";

import { Login } from "App/Login";
import { CheckIsLockedMsg } from "background/vault";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { useEventListener } from "@namada/hooks";
import { Events } from "@namada/types";

type Props = {
  children: React.ReactNode;
};

export const LockWrapper: React.FC<Props> = ({ children }) => {
  const [isLocked, setLocked] = useState<undefined | boolean>();
  const requester = useRequester();

  const queryIsLocked = async (): Promise<void> => {
    try {
      setLocked(
        await requester.sendMessage(Ports.Background, new CheckIsLockedMsg())
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    queryIsLocked();
  }, []);

  useEventListener(Events.ExtensionLocked, () => {
    setLocked(true);
  });

  if (isLocked === undefined) {
    return <></>;
  }

  if (isLocked) {
    return <Login onUnlock={() => setLocked(false)} />;
  }

  return <>{children}</>;
};

export default LockWrapper;
