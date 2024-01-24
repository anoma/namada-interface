import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveTxMsg,
} from "provider";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  ConnectInterfaceResponseMsg,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignatureMsg,
  SubmitApprovedTxMsg,
} from "./messages";
import { ApprovalsService } from "./service";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveTxMsg:
        return handleApproveTxMsg(service)(env, msg as ApproveTxMsg);
      case RejectTxMsg:
        return handleRejectTxMsg(service)(env, msg as RejectTxMsg);
      case SubmitApprovedTxMsg:
        return handleSubmitApprovedTxMsg(service)(
          env,
          msg as SubmitApprovedTxMsg
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
      case ApproveSignArbitraryMsg:
        return handleApproveSignArbitraryMsg(service)(
          env,
          msg as ApproveSignArbitraryMsg
        );
      case RejectSignatureMsg:
        return handleRejectSignatureMsg(service)(
          env,
          msg as RejectSignatureMsg
        );
      case SubmitApprovedSignatureMsg:
        return handleSubmitApprovedSignatureMsg(service)(
          env,
          msg as SubmitApprovedSignatureMsg
        );

      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleApproveTxMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveTxMsg> = (service) => {
  return async (_, { txType, specificMsg, txMsg, accountType }) => {
    return await service.approveTx(txType, specificMsg, txMsg, accountType);
  };
};

const handleRejectTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectTxMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.rejectTx(msgId);
  };
};

const handleSubmitApprovedTxMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedTxMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.submitTx(msgId);
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

const handleApproveSignArbitraryMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveSignArbitraryMsg> = (service) => {
  return async (_, { signer, data }) => {
    return await service.approveSignature(signer, data);
  };
};

const handleRejectSignatureMsg: (
  service: ApprovalsService
) => InternalHandler<RejectSignatureMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId }) => {
    return await service.rejectSignature(popupTabId, msgId);
  };
};

const handleSubmitApprovedSignatureMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedSignatureMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId, signer }) => {
    return await service.submitSignature(popupTabId, msgId, signer);
  };
};
