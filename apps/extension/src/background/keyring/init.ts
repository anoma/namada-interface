import { Router } from "../../router";
import { LockKeyRingMsg, UnlockKeyRingMsg, CheckPasswordMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(CheckPasswordMsg);

  router.addHandler(ROUTE, getHandler(service));
}
