import { GetChainMsg } from "provider/messages";
import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { UpdateChainMsg } from "./messages";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainMsg);
  router.registerMessage(UpdateChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
