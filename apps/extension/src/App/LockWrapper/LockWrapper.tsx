import React from "react";
import { useNavigate } from "react-router-dom";

import { Icon, IconName } from "@namada/components";
import { ButtonContainer, LockExtensionButton } from "./LockWrapper.components";
import { LockKeyRingMsg } from "background/keyring";
import { Ports } from "router";
import { Status } from "App/App";
import { TopLevelRoute } from "App/types";
import { ExtensionRequester } from "extension";

type Props = {
  requester: ExtensionRequester;
  isLocked: boolean;
  setStatus: (status?: Status) => void;
  lockKeyRing: () => void;
  children: JSX.Element;
};

const LockWrapper: React.FC<Props> = ({
  requester,
  isLocked,
  lockKeyRing,
  setStatus,
  children,
}) => {
  const navigate = useNavigate();

  const handleLock = async (): Promise<void> => {
    try {
      await requester.sendMessage(Ports.Background, new LockKeyRingMsg());
      setStatus(undefined);
      lockKeyRing();
    } catch (e) {
      console.error(e);
    } finally {
      navigate(TopLevelRoute.Accounts);
    }
  };

  return (
    <>
      {!isLocked && (
        <ButtonContainer>
          <LockExtensionButton onClick={handleLock}>
            <span>Lock</span> <Icon iconName={IconName.Lock} />
          </LockExtensionButton>
        </ButtonContainer>
      )}
      {children}
    </>
  );
};

export default LockWrapper;
