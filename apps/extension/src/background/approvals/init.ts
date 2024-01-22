import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveTxMsg,
} from "provider";
import { Router } from "router";
import {
  ConnectInterfaceResponseMsg,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignatureMsg,
  SubmitApprovedTxMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ApprovalsService } from "./service";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveTxMsg);
  router.registerMessage(RejectTxMsg);
  router.registerMessage(SubmitApprovedTxMsg);
  router.registerMessage(ApproveSignArbitraryMsg);
  router.registerMessage(RejectSignatureMsg);
  router.registerMessage(SubmitApprovedSignatureMsg);
  router.registerMessage(ApproveConnectInterfaceMsg);
  router.registerMessage(ConnectInterfaceResponseMsg);
  router.registerMessage(RevokeConnectionMsg);

  router.addHandler(ROUTE, getHandler(service));
}
