import {
  ApproveConnectInterfaceMsg,
  ApproveDisconnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  ApproveUpdateDefaultAccountMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Env, Handler, InternalHandler, Message } from "router";
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
      case CheckIsApprovedSiteMsg:
        return handleCheckIsApprovedSite(service)(
          env,
          msg as CheckIsApprovedSiteMsg
        );
      case ApproveDisconnectInterfaceMsg:
        return handleApproveDisconnectInterfaceMsg(service)(
          env,
          msg as ApproveDisconnectInterfaceMsg
        );
      case DisconnectInterfaceResponseMsg:
        return handleDisconnectInterfaceResponseMsg(service)(
          env,
          msg as DisconnectInterfaceResponseMsg
        );
      case RevokeConnectionMsg:
        return handleRevokeConnectionMsg(service)(
          env,
          msg as RevokeConnectionMsg
        );
      case ApproveUpdateDefaultAccountMsg:
        return handleApproveUpdateDefaultAccountMsg(service)(
          env,
          msg as ApproveUpdateDefaultAccountMsg
        );
      case SubmitUpdateDefaultAccountMsg:
        return handleSubmitUpdateDefaultAccountMsg(service)(
          env,
          msg as SubmitUpdateDefaultAccountMsg
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
      case ReplaceMaspSignaturesMsg:
        return handleReplaceMaspSignaturesMsg(service)(
          env,
          msg as ReplaceMaspSignaturesMsg
        );
      case SignMaspMsg:
        return handleSignMaspMsg(service)(env, msg as SignMaspMsg);

      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleIsConnectionApprovedMsg: (
  service: ApprovalsService
) => InternalHandler<IsConnectionApprovedMsg> = (service) => {
  return async (_, { origin, chainId }) => {
    return await service.isConnectionApproved(origin, chainId);
  };
};

const handleApproveConnectInterfaceMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveConnectInterfaceMsg> = (service) => {
  return async (_, { origin, chainId }) => {
    return await service.approveConnection(origin, chainId);
  };
};

const handleConnectInterfaceResponseMsg: (
  service: ApprovalsService
) => InternalHandler<ConnectInterfaceResponseMsg> = (service) => {
  return async (
    { senderTabId: popupTabId },
    { interfaceOrigin, allowConnection, chainId }
  ) => {
    return await service.approveConnectionResponse(
      popupTabId,
      interfaceOrigin,
      allowConnection,
      chainId
    );
  };
};

const handleApproveDisconnectInterfaceMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveDisconnectInterfaceMsg> = (service) => {
  return async (_, { origin, chainId }) => {
    return await service.approveDisconnection(origin, chainId);
  };
};

const handleDisconnectInterfaceResponseMsg: (
  service: ApprovalsService
) => InternalHandler<DisconnectInterfaceResponseMsg> = (service) => {
  return async (
    { senderTabId: popupTabId },
    { interfaceOrigin, revokeConnection }
  ) => {
    return await service.approveDisconnectionResponse(
      popupTabId,
      interfaceOrigin,
      revokeConnection
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

const handleApproveUpdateDefaultAccountMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveUpdateDefaultAccountMsg> = (service) => {
  return async (_, { address }) => {
    return await service.approveUpdateDefaultAccount(address);
  };
};

const handleSubmitUpdateDefaultAccountMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitUpdateDefaultAccountMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { address }) => {
    return await service.submitUpdateDefaultAccount(popupTabId, address);
  };
};

const handleApproveSignTxMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveSignTxMsg> = (service) => {
  return async (_, { origin, signer, tx, checksums }) => {
    return await service.approveSignTx(signer, tx, origin, checksums);
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
  return async (_, { signer, data, origin }) => {
    return await service.approveSignArbitrary(signer, data, origin);
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

const handleReplaceMaspSignaturesMsg: (
  service: ApprovalsService
) => InternalHandler<ReplaceMaspSignaturesMsg> = (service) => {
  return async (_, { msgId, signatures }) => {
    return await service.replaceMaspSignatures(msgId, signatures);
  };
};

const handleSignMaspMsg: (
  service: ApprovalsService
) => InternalHandler<SignMaspMsg> = (service) => {
  return async (_, { msgId, signer }) => {
    return await service.signMasp(msgId, signer);
  };
};

const handleCheckIsApprovedSite: (
  service: ApprovalsService
) => InternalHandler<CheckIsApprovedSiteMsg> = (service) => {
  return async (_, { interfaceOrigin, chainId }) => {
    return await service.isConnectionApproved(interfaceOrigin, chainId);
  };
};
