import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  ConnectInterfaceResponseMsg,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
} from "./messages";
import { ApprovalsService } from "./service";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RejectTxMsg:
        return handleRejectTxMsg(service)(env, msg as RejectTxMsg);
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
      case SubmitApprovedSignArbitraryMsg:
        return handleSubmitApprovedSignatureMsg(service)(
          env,
          msg as SubmitApprovedSignArbitraryMsg
        );

      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleRejectTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectTxMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.rejectTx(msgId);
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
  return async (_, { accountType, signer, tx }) => {
    return await service.approveSignTx(accountType, signer, tx);
  };
};

const handleApproveSignArbitraryMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveSignArbitraryMsg> = (service) => {
  return async (_, { signer, data }) => {
    return await service.approveSignArbitrary(signer, data);
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
) => InternalHandler<SubmitApprovedSignArbitraryMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { msgId, signer }) => {
    return await service.submitSignArbitrary(popupTabId, msgId, signer);
  };
};
