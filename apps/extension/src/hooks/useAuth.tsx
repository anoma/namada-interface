import { useNavigate } from "react-router-dom";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { CheckIsLockedMsg } from "background/vault";
import { TopLevelRoute } from "App/types";
import { paramsToUrl } from "@namada/utils";

export const isKeyChainLocked = async (
  requester: ExtensionRequester
): Promise<boolean> => {
  return await requester
    .sendMessage(Ports.Background, new CheckIsLockedMsg())
    .catch((e) => {
      throw new Error(`Requester error: ${e}`);
    });
};

export const redirectToLogin = (
  navigate: ReturnType<typeof useNavigate>,
  route: TopLevelRoute,
  prompt: string
): void => {
  navigate(paramsToUrl(TopLevelRoute.Login, { redirect: route, prompt }));
};

const useAuth = (
  requester: ExtensionRequester
): ((
  route: TopLevelRoute,
  prompt: string,
  callback?: () => void
) => Promise<void>) => {
  const navigate = useNavigate();
  return async (
    route: TopLevelRoute,
    prompt: string,
    callback?: () => void
  ): Promise<void> => {
    if (await isKeyChainLocked(requester)) {
      return redirectToLogin(navigate, route, prompt);
    }
    if (callback) {
      callback();
    }
  };
};

export default useAuth;
