import { Router } from "router";
import {
  ApproveBondMsg,
  ApproveTransferMsg,
  ApproveIbcTransferMsg,
  ApproveUnbondMsg,
  ApproveWithdrawMsg,
} from "provider";
import {
  RejectTxMsg,
  SubmitApprovedBondMsg,
  SubmitApprovedUnbondMsg,
  SubmitApprovedTransferMsg,
  SubmitApprovedIbcTransferMsg,
  SubmitApprovedWithdrawMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { ApprovalsService } from "./service";
import { getHandler } from "./handler";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveBondMsg);
  router.registerMessage(ApproveTransferMsg);
  router.registerMessage(ApproveIbcTransferMsg);
  router.registerMessage(ApproveUnbondMsg);
  router.registerMessage(ApproveWithdrawMsg);
  router.registerMessage(RejectTxMsg);
  router.registerMessage(SubmitApprovedBondMsg);
  router.registerMessage(SubmitApprovedUnbondMsg);
  router.registerMessage(SubmitApprovedTransferMsg);
  router.registerMessage(SubmitApprovedIbcTransferMsg);
  router.registerMessage(SubmitApprovedWithdrawMsg);

  router.addHandler(ROUTE, getHandler(service));
}
