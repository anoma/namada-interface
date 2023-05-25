import { Router } from "router";
import { SubmitApproveTxMsg } from "./messages";

import { ROUTE } from "./constants";
import { ApprovalsService } from "./service";
import { getHandler } from "./handler";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(SubmitApproveTxMsg);

  router.addHandler(ROUTE, getHandler(service));
}
