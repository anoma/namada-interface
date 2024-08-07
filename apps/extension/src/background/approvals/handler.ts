import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  ConnectInterfaceResponseMsg,
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
import { ApprovalsService } from "./service";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case IsConnectionApprovedMsg:
        return handleIsConnectionApprovedMsg(service)(
          env,
          msg as IsConnectionApprovedMsg
        );
      case ApproveConnectInterfaceMsg:
        return handleApproveConnectInterfaceMsg(service)(
          env,
          msg as ApproveConnectInterfaceMsg
        );
      case ConnectInterfaceResponseMsg:
        return handleConnectInterfaceResponseMsg(service)(
          env,
          msg as ConnectInterfaceResponseMsg
        );
      case RevokeConnectionMsg:
        return handleRevokeConnectionMsg(service)(
          env,
          msg as RevokeConnectionMsg
        );
      case ApproveSignTxMsg:
        return handleApproveSignTxMsg(service)(env, msg as ApproveSignTxMsg);
      case RejectSignTxMsg:
        return handleRejectSignTxMsg(service)(env, msg as RejectSignTxMsg);
      case SubmitApprovedSignTxMsg:
        return handleSubmitApprovedSignTxMsg(service)(
          env,
          msg as SubmitApprovedSignTxMsg
        );
      case ApproveSignArbitraryMsg:
        return handleApproveSignArbitraryMsg(service)(
          env,
          msg as ApproveSignArbitraryMsg
        );
      case RejectSignArbitraryMsg:
        return handleRejectSignArbitraryMsg(service)(
          env,
          msg as RejectSignArbitraryMsg
        );
      case SubmitApprovedSignArbitraryMsg:
        return handleSubmitApprovedSignArbitraryMsg(service)(
          env,
          msg as SubmitApprovedSignArbitraryMsg
        );
      case QueryTxDetailsMsg:
        return handleQueryTxDetails(service)(env, msg as QueryTxDetailsMsg);
      case QueryPendingTxBytesMsg:
        return handleQueryPendingTxBytes(service)(
          env,
          msg as QueryPendingTxBytesMsg
        );
      case QuerySignArbitraryDataMsg:
        return handleQuerySignArbitraryData(service)(
          env,
          msg as QuerySignArbitraryDataMsg
        );
      case SubmitApprovedSignLedgerTxMsg:
        return handleSubmitApprovedSignLedgerTxMsg(service)(
          env,
          msg as SubmitApprovedSignLedgerTxMsg
        );

      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleIsConnectionApprovedMsg: (
  service: ApprovalsService
) => InternalHandler<IsConnectionApprovedMsg> = (service) => {
  return async (_, { origin }) => {
    return await service.isConnectionApproved(origin);
  };
};

const handleApproveConnectInterfaceMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveConnectInterfaceMsg> = (service) => {
  return async ({ senderTabId: interfaceTabId }, { origin }) => {
    return await service.approveConnection(interfaceTabId, origin);
  };
};

const handleConnectInterfaceResponseMsg: (
  service: ApprovalsService
) => InternalHandler<ConnectInterfaceResponseMsg> = (service) => {
  return async (
    { senderTabId: popupTabId },
    { interfaceTabId, interfaceOrigin, allowConnection }
  ) => {
    return await service.approveConnectionResponse(
      interfaceTabId,
      interfaceOrigin,
      allowConnection,
      popupTabId
    );
  };
};

const handleRevokeConnectionMsg: (
  service: ApprovalsService
) => InternalHandler<RevokeConnectionMsg> = (service) => {
  return async (_, { originToRevoke }) => {
    return await service.revokeConnection(originToRevoke);
  };
};

const handleApproveSignTxMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveSignTxMsg> = (service) => {
  return async (_, { signer, tx, checksums }) => {
    return await service.approveSignTx(signer, tx, checksums);
  };
};

const handleRejectSignTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectSignTxMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId }) => {
    return await service.rejectSignTx(popupTabId, msgId);
  };
};

const handleSubmitApprovedSignTxMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedSignTxMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId, signer }) => {
    return await service.submitSignTx(popupTabId, msgId, signer);
  };
};

const handleApproveSignArbitraryMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveSignArbitraryMsg> = (service) => {
  return async (_, { signer, data }) => {
    return await service.approveSignArbitrary(signer, data);
  };
};

const handleRejectSignArbitraryMsg: (
  service: ApprovalsService
) => InternalHandler<RejectSignArbitraryMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId }) => {
    return await service.rejectSignArbitrary(popupTabId, msgId);
  };
};

const handleSubmitApprovedSignArbitraryMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedSignArbitraryMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId, signer }) => {
    return await service.submitSignArbitrary(popupTabId, msgId, signer);
  };
};

const handleQueryTxDetails: (
  service: ApprovalsService
) => InternalHandler<QueryTxDetailsMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.queryTxDetails(msgId);
  };
};

const handleQueryPendingTxBytes: (
  service: ApprovalsService
) => InternalHandler<QueryPendingTxBytesMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.queryPendingTxBytes(msgId);
  };
};

const handleQuerySignArbitraryData: (
  service: ApprovalsService
) => InternalHandler<QuerySignArbitraryDataMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.querySignArbitraryDetails(msgId);
  };
};

const handleSubmitApprovedSignLedgerTxMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedSignLedgerTxMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId, responseSign }) => {
    return await service.submitSignLedgerTx(popupTabId, msgId, responseSign);
  };
};
