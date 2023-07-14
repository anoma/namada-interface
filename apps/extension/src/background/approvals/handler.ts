import { Handler, Env, Message, InternalHandler } from "router";
import { ApprovalsService } from "./service";
import { ApproveBondMsg, ApproveUnbondMsg, ApproveTransferMsg } from "provider";
import {
  RejectTxMsg,
  SubmitApprovedTransferMsg,
  SubmitApprovedBondMsg,
  SubmitApprovedUnbondMsg,
} from "./messages";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveTransferMsg:
        return handleApproveTransferMsg(service)(
          env,
          msg as ApproveTransferMsg
        );
      case ApproveBondMsg:
        return handleApproveBondMsg(service)(env, msg as ApproveBondMsg);
      case ApproveUnbondMsg:
        return handleApproveUnbondMsg(service)(env, msg as ApproveUnbondMsg);
      case RejectTxMsg:
        return handleRejectTxMsg(service)(env, msg as RejectTxMsg);
      case SubmitApprovedTransferMsg:
        return handleSubmitApprovedTransferMsg(service)(
          env,
          msg as SubmitApprovedTransferMsg
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

const handleApproveBondMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveBondMsg> = (service) => {
  return async (_, { txMsg, accountType, publicKey }) => {
    return await service.approveBond(txMsg, accountType, publicKey);
  };
};

const handleApproveUnbondMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveUnbondMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveUnbond(txMsg, accountType);
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
