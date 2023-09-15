import { Handler, Env, Message, InternalHandler } from "router";
import { ApprovalsService } from "./service";
import {
  ApproveBondMsg,
  ApproveUnbondMsg,
  ApproveTransferMsg,
  ApproveIbcTransferMsg,
  ApproveWithdrawMsg,
  ApproveConnectInterfaceMsg,
} from "provider";
import {
  RejectTxMsg,
  SubmitApprovedTransferMsg,
  SubmitApprovedIbcTransferMsg,
  SubmitApprovedBondMsg,
  SubmitApprovedUnbondMsg,
  SubmitApprovedWithdrawMsg,
  ConnectInterfaceResponseMsg,
  RevokeConnectionMsg,
} from "./messages";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveTransferMsg:
        return handleApproveTransferMsg(service)(
          env,
          msg as ApproveTransferMsg
        );
      case ApproveIbcTransferMsg:
        return handleApproveIbcTransferMsg(service)(
          env,
          msg as ApproveIbcTransferMsg
        );

      case ApproveBondMsg:
        return handleApproveBondMsg(service)(env, msg as ApproveBondMsg);
      case ApproveUnbondMsg:
        return handleApproveUnbondMsg(service)(env, msg as ApproveUnbondMsg);
      case ApproveWithdrawMsg:
        return handleApproveWithdrawMsg(service)(
          env,
          msg as ApproveWithdrawMsg
        );
      case RejectTxMsg:
        return handleRejectTxMsg(service)(env, msg as RejectTxMsg);
      case SubmitApprovedTransferMsg:
        return handleSubmitApprovedTransferMsg(service)(
          env,
          msg as SubmitApprovedTransferMsg
        );
      case SubmitApprovedIbcTransferMsg:
        return handleSubmitApprovedIBCTransferMsg(service)(
          env,
          msg as SubmitApprovedIbcTransferMsg
        );

      case SubmitApprovedBondMsg:
        return handleSubmitApprovedBondMsg(service)(
          env,
          msg as SubmitApprovedBondMsg
        );
      case SubmitApprovedUnbondMsg:
        return handleSubmitApprovedUnbondMsg(service)(
          env,
          msg as SubmitApprovedUnbondMsg
        );
      case SubmitApprovedWithdrawMsg:
        return handleSubmitApprovedWithdrawMsg(service)(
          env,
          msg as SubmitApprovedUnbondMsg
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

const handleApproveTransferMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveTransferMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveTransfer(txMsg, accountType);
  };
};

const handleApproveIbcTransferMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveIbcTransferMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveIbcTransfer(txMsg, accountType);
  };
};

const handleRejectTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectTxMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.rejectTx(msgId);
  };
};

const handleSubmitApprovedTransferMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedTransferMsg> = (service) => {
  return async (_, { msgId, password }) => {
    return await service.submitTransfer(msgId, password);
  };
};

const handleSubmitApprovedIBCTransferMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedIbcTransferMsg> = (service) => {
  return async (_, { msgId, password }) => {
    return await service.submitIbcTransfer(msgId, password);
  };
};

const handleApproveBondMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveBondMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveBond(txMsg, accountType);
  };
};

const handleApproveUnbondMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveUnbondMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveUnbond(txMsg, accountType);
  };
};

const handleApproveWithdrawMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveWithdrawMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveWithdraw(txMsg, accountType);
  };
};

const handleSubmitApprovedBondMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedBondMsg> = (service) => {
  return async (_, { msgId, password }) => {
    return await service.submitBond(msgId, password);
  };
};

const handleSubmitApprovedUnbondMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedUnbondMsg> = (service) => {
  return async (_, { msgId, password }) => {
    return await service.submitUnbond(msgId, password);
  };
};

const handleSubmitApprovedWithdrawMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedWithdrawMsg> = (service) => {
  return async (_, { msgId, password }) => {
    return await service.submitWithdraw(msgId, password);
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
