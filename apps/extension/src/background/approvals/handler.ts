import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  ConnectInterfaceResponseMsg,
  RejectSignArbitraryMsg,
  RejectSignTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
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
  return async (_, { signer, txBytes, signingDataBytes }) => {
    return await service.approveSignTx(signer, txBytes, signingDataBytes);
  };
};

const handleRejectSignTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectSignTxMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.rejectSignTx(msgId);
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
    return await service.rejectSignature(popupTabId, msgId);
  };
};

const handleSubmitApprovedSignArbitraryMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedSignArbitraryMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId, signer }) => {
    return await service.submitSignArbitrary(popupTabId, msgId, signer);
  };
};
