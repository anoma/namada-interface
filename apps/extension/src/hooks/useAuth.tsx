import { TopLevelRoute } from "App/types";
import { ExtensionRequester } from "extension";
import { useNavigate } from "react-router-dom";
import { CheckIsLockedMsg } from "background/keyring";

import { Ports } from "router";

const useAuth = (
  requester: ExtensionRequester
): ((
  route: TopLevelRoute,
  prompt: string,
  callback: () => void
) => Promise<void>) => {
  const navigate = useNavigate();
  return async (route: TopLevelRoute, prompt: string, callback: () => void) => {
    const isKeyChainLocked = await requester.sendMessage(
      Ports.Background,
      new CheckIsLockedMsg()
    );
    if (isKeyChainLocked) {
      navigate(`${TopLevelRoute.Login}?redirect=${route}&prompt=${prompt}`);
    } else {
      callback();
    }
  };
};

export default useAuth;
