import { Router } from "router";
import {
  GetChainMsg,
  GetChainsMsg,
  GetSignerMsg,
  SuggestChainMsg,
  RemoveChainMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainMsg);
  router.registerMessage(GetChainsMsg);
  router.registerMessage(GetSignerMsg);
  router.registerMessage(SuggestChainMsg);
  router.registerMessage(RemoveChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
