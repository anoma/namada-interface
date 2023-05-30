import { Handler, Env, Message, InternalHandler } from "router";
import { ApprovalsService } from "./service";
import { ApproveTransferMsg } from "provider";
import { RejectTransferMsg, SubmitApprovedTransferMsg } from "./messages";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveTransferMsg:
        return handleApproveTxMsg(service)(env, msg as ApproveTransferMsg);
      case RejectTransferMsg:
        return handleRejectTxMsg(service)(env, msg as RejectTransferMsg);
      case SubmitApprovedTransferMsg:
        return handleSubmitApprovedTxMsg(service)(
          env,
          msg as SubmitApprovedTransferMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleApproveTxMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveTransferMsg> = (service) => {
  return async (_, { txMsg, accountType }) => {
    return await service.approveTransfer(txMsg, accountType);
  };
};

const handleRejectTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectTransferMsg> = (service) => {
  return async (_, { msgId }) => {
    return await service.rejectTransfer(msgId);
  };
};

const handleSubmitApprovedTxMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedTransferMsg> = (service) => {
  return async (_, { msgId, password }) => {
    return await service.submitTransfer(msgId, password);
  };
};
