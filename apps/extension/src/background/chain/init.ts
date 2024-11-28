import {} from "provider/messages";
import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { GetChainMsg, UpdateChainMsg } from "./messages";
import { ChainService } from "./service";

export function init(router: Router, service: ChainService): void {
  router.registerMessage(GetChainMsg);
  router.registerMessage(UpdateChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
