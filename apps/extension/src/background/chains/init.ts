import { GetChainMsg, GetChainsMsg } from "provider/messages";
import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainMsg);
  router.registerMessage(GetChainsMsg);

  router.addHandler(ROUTE, getHandler(service));
}
