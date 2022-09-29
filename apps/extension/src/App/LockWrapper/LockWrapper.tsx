import React from "react";
import { useNavigate } from "react-router-dom";

import { Icon, IconName } from "@anoma/components";
import { ButtonContainer, LockExtensionButton } from "./LockWrapper.components";
import { LockKeyRingMsg } from "background/keyring";
import { Ports } from "router";
import { Status } from "App/App";
import { TopLevelRoute } from "App/types";
import { ExtensionRequester } from "extension";

type Props = {
  requester: ExtensionRequester;
  setStatus: (status?: Status) => void;
  children: JSX.Element;
};

const LockWrapper: React.FC<Props> = ({ requester, setStatus, children }) => {
  const navigate = useNavigate();

  const handleLock = async () => {
    try {
      await requester.sendMessage(Ports.Background, new LockKeyRingMsg());
      setStatus(undefined);
    } catch (e) {
      console.error(e);
    } finally {
      navigate(TopLevelRoute.Login);
    }
  };

  return (
    <>
      <ButtonContainer>
        <LockExtensionButton onClick={handleLock}>
          <span>Lock</span> <Icon iconName={IconName.Lock} />
        </LockExtensionButton>
      </ButtonContainer>
      {children}
    </>
  );
};

export default LockWrapper;
