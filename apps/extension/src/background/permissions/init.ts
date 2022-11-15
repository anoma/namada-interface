import { Router } from "router";

import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionsService } from "./service";

export function init(router: Router, service: PermissionsService): void {
  router.addHandler(ROUTE, getHandler(service));
}
