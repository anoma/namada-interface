import { Router } from "router";

import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import {
  AddOriginPermission,
  EnableAccessMsg,
  GetOriginPermissionsMsg,
  RemoveOriginPermission,
  GetPermittedChainsMsg,
} from "./messages";
import { PermissionsService } from "./service";

export function init(router: Router, service: PermissionsService): void {
  router.registerMessage(EnableAccessMsg);
  router.registerMessage(GetOriginPermissionsMsg);
  router.registerMessage(AddOriginPermission);
  router.registerMessage(RemoveOriginPermission);
  router.registerMessage(GetPermittedChainsMsg);

  router.addHandler(ROUTE, getHandler(service));
}
