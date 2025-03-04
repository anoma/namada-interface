import { Router } from "router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import {
  CheckIsLockedMsg,
  CheckPasswordInitializedMsg,
  CheckPasswordMsg,
  CheckRequiresAuthMsg,
  CreatePasswordMsg,
  LockVaultMsg,
  LogoutMsg,
  ResetPasswordMsg,
  UnlockVaultMsg,
} from "./messages";
import { VaultService } from "./service";

export function init(router: Router, service: VaultService): void {
  router.registerMessage(CheckIsLockedMsg);
  router.registerMessage(LockVaultMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(ResetPasswordMsg);
  router.registerMessage(UnlockVaultMsg);
  router.registerMessage(CheckPasswordInitializedMsg);
  router.registerMessage(CheckRequiresAuthMsg);
  router.registerMessage(CreatePasswordMsg);
  router.registerMessage(LogoutMsg);
  router.addHandler(ROUTE, getHandler(service));
}
