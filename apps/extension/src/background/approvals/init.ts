import { Router } from "router";
import { ApproveTxMsg, ApproveConnectInterfaceMsg } from "provider";
import {
  RejectTxMsg,
  SubmitApprovedTxMsg,
  ConnectInterfaceResponseMsg,
  RevokeConnectionMsg,
  SubmitApprovedVoteProposalMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { ApprovalsService } from "./service";
import { getHandler } from "./handler";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveTxMsg);
  router.registerMessage(RejectTxMsg);
  router.registerMessage(SubmitApprovedTxMsg);
  router.registerMessage(ApproveConnectInterfaceMsg);
  router.registerMessage(ConnectInterfaceResponseMsg);
  router.registerMessage(RevokeConnectionMsg);
  router.registerMessage(SubmitApprovedVoteProposalMsg);

  router.addHandler(ROUTE, getHandler(service));
}
