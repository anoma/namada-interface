import { Router } from "router";
import { ApproveTxMsg, RejectTxMsg, SubmitApprovedTxMsg } from "./messages";

import { ROUTE } from "./constants";
import { ApprovalsService } from "./service";
import { getHandler } from "./handler";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveTxMsg);
  router.registerMessage(RejectTxMsg);
  router.registerMessage(SubmitApprovedTxMsg);

  router.addHandler(ROUTE, getHandler(service));
}
