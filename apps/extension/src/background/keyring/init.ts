import { Router } from "router";
import {
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  GenerateMnemonicMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(GenerateMnemonicMsg);

  router.addHandler(ROUTE, getHandler(service));
}
