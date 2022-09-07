import { Router } from "../../router";
import { GetChainMsg, SuggestChainMsg, RemoveChainMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainMsg);
  router.registerMessage(SuggestChainMsg);
  router.registerMessage(RemoveChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
