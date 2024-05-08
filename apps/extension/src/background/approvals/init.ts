import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Router } from "router";
import {
  ConnectInterfaceResponseMsg,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ApprovalsService } from "./service";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveSignTxMsg);
  router.registerMessage(RejectTxMsg);
  router.registerMessage(ApproveSignArbitraryMsg);
  router.registerMessage(RejectSignatureMsg);
  router.registerMessage(SubmitApprovedSignArbitraryMsg);
  router.registerMessage(IsConnectionApprovedMsg);
  router.registerMessage(ApproveConnectInterfaceMsg);
  router.registerMessage(ConnectInterfaceResponseMsg);
  router.registerMessage(RevokeConnectionMsg);

  router.addHandler(ROUTE, getHandler(service));
}
