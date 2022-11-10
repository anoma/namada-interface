import { Router } from "router";
import { ROUTE } from "./constants";
import { RemoveChainMsg } from "./messages";
import { SuggestChainMsg, GetChainsMsg, GetChainMsg } from "provider/messages";
import { getHandler } from "./handler";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainMsg);
  router.registerMessage(GetChainsMsg);
  router.registerMessage(SuggestChainMsg);
  router.registerMessage(RemoveChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
