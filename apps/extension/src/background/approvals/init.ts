import { Router } from "router";
import { ApproveTransferMsg } from "provider";
import { RejectTransferMsg, SubmitApprovedTransferMsg } from "./messages";

import { ROUTE } from "./constants";
import { ApprovalsService } from "./service";
import { getHandler } from "./handler";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveTransferMsg);
  router.registerMessage(RejectTransferMsg);
  router.registerMessage(SubmitApprovedTransferMsg);

  router.addHandler(ROUTE, getHandler(service));
}
