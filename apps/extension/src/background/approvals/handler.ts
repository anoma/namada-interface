import { Handler, Env, Message, InternalHandler } from "router";
import { ApprovalsService } from "./service";
import {
  ApproveTxMsg,
  ApproveConnectInterfaceMsg,
} from "provider";
import {
  RejectTxMsg,
  SubmitApprovedTxMsg,
  ConnectInterfaceResponseMsg,
  RevokeConnectionMsg,
} from "./messages";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveTxMsg:
        return handleApproveTxMsg(service)(
          env,
          msg as ApproveTxMsg
        );
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
  return async (_, { msgId, password }) => {
    return await service.submitTx(msgId, password);
  };
};

const handleApproveConnectInterfaceMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveConnectInterfaceMsg> = (service) => {
  return async ({ senderTabId: interfaceTabId }, { chainId, origin }) => {
    return await service.approveConnection(interfaceTabId, chainId, origin);
  };
};

const handleConnectInterfaceResponseMsg: (
  service: ApprovalsService
) => InternalHandler<ConnectInterfaceResponseMsg> = (service) => {
  return async ({ senderTabId: popupTabId }, { interfaceTabId, chainId, interfaceOrigin, allowConnection }) => {
    return await service.approveConnectionResponse(
      interfaceTabId, chainId, interfaceOrigin, allowConnection, popupTabId
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
