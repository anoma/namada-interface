import { Router } from "router";
import { ApproveBondMsg, ApproveTransferMsg } from "provider";
import {
  RejectTxMsg,
  SubmitApprovedBondMsg,
  SubmitApprovedUnbondMsg,
  SubmitApprovedTransferMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { ApprovalsService } from "./service";
import { getHandler } from "./handler";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveBondMsg);
  router.registerMessage(ApproveTransferMsg);
  router.registerMessage(RejectTxMsg);
  router.registerMessage(SubmitApprovedBondMsg);
  router.registerMessage(SubmitApprovedUnbondMsg);
  router.registerMessage(SubmitApprovedTransferMsg);

  router.addHandler(ROUTE, getHandler(service));
}
