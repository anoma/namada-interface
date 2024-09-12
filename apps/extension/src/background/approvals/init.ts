import {
  ApproveConnectInterfaceMsg,
  ApproveDisconnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Router } from "router";
import {
  ConnectInterfaceResponseMsg,
  DisconnectInterfaceResponseMsg,
  QueryPendingTxBytesMsg,
  QuerySignArbitraryDataMsg,
  QueryTxDetailsMsg,
  RejectSignArbitraryMsg,
  RejectSignTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
  SubmitApprovedSignLedgerTxMsg,
  SubmitApprovedSignTxMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ApprovalsService } from "./service";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveSignTxMsg);
  router.registerMessage(ApproveSignArbitraryMsg);
  router.registerMessage(RejectSignTxMsg);
  router.registerMessage(RejectSignArbitraryMsg);
  router.registerMessage(SubmitApprovedSignTxMsg);
  router.registerMessage(SubmitApprovedSignArbitraryMsg);
  router.registerMessage(SubmitApprovedSignLedgerTxMsg);
  router.registerMessage(IsConnectionApprovedMsg);
  router.registerMessage(ApproveConnectInterfaceMsg);
  router.registerMessage(ApproveDisconnectInterfaceMsg);
  router.registerMessage(ConnectInterfaceResponseMsg);
  router.registerMessage(DisconnectInterfaceResponseMsg);
  router.registerMessage(RevokeConnectionMsg);
  router.registerMessage(QueryTxDetailsMsg);
  router.registerMessage(QuerySignArbitraryDataMsg);
  router.registerMessage(QueryPendingTxBytesMsg);

  router.addHandler(ROUTE, getHandler(service));
}
