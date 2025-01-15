import {
  ApproveConnectInterfaceMsg,
  ApproveDisconnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  ApproveUpdateDefaultAccountMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Router } from "router";
import {
  CheckIsApprovedSiteMsg,
  ConnectInterfaceResponseMsg,
  DisconnectInterfaceResponseMsg,
  QueryPendingTxBytesMsg,
  QuerySignArbitraryDataMsg,
  QueryTxDetailsMsg,
  RejectSignArbitraryMsg,
  RejectSignTxMsg,
  ReplaceMaspSignaturesMsg,
  RevokeConnectionMsg,
  SignMaspMsg,
  SubmitApprovedSignArbitraryMsg,
  SubmitApprovedSignLedgerTxMsg,
  SubmitApprovedSignTxMsg,
  SubmitUpdateDefaultAccountMsg,
} from "./messages";

import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ApprovalsService } from "./service";

export function init(router: Router, service: ApprovalsService): void {
  router.registerMessage(ApproveSignTxMsg);
  router.registerMessage(ApproveSignArbitraryMsg);
  router.registerMessage(CheckIsApprovedSiteMsg);
  router.registerMessage(RejectSignTxMsg);
  router.registerMessage(RejectSignArbitraryMsg);
  router.registerMessage(SubmitApprovedSignTxMsg);
  router.registerMessage(SubmitApprovedSignArbitraryMsg);
  router.registerMessage(SubmitApprovedSignLedgerTxMsg);
  router.registerMessage(ReplaceMaspSignaturesMsg);
  router.registerMessage(IsConnectionApprovedMsg);
  router.registerMessage(ApproveConnectInterfaceMsg);
  router.registerMessage(ConnectInterfaceResponseMsg);
  router.registerMessage(ApproveDisconnectInterfaceMsg);
  router.registerMessage(DisconnectInterfaceResponseMsg);
  router.registerMessage(RevokeConnectionMsg);
  router.registerMessage(ApproveUpdateDefaultAccountMsg);
  router.registerMessage(SubmitUpdateDefaultAccountMsg);
  router.registerMessage(QueryTxDetailsMsg);
  router.registerMessage(QuerySignArbitraryDataMsg);
  router.registerMessage(QueryPendingTxBytesMsg);
  router.registerMessage(SignMaspMsg);

  router.addHandler(ROUTE, getHandler(service));
}
