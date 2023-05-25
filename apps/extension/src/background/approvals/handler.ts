import { Handler, Env, Message, InternalHandler } from "router";
import { ApprovalsService } from "./service";
import { ApproveTxMsg, RejectTxMsg, SubmitApprovedTxMsg } from "./messages";

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
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleApproveTxMsg: (
  service: ApprovalsService
) => InternalHandler<ApproveTxMsg> = (service) => {
  return async (_, { txMsg }) => {
    return await service.approveTx(txMsg);
  };
};

const handleRejectTxMsg: (
  service: ApprovalsService
) => InternalHandler<RejectTxMsg> = (service) => {
  return async (_, { txId }) => {
    return await service.rejectTx(txId);
  };
};

const handleSubmitApprovedTxMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApprovedTxMsg> = (service) => {
  return async (_, { txId, password }) => {
    return await service.submitTx(txId, password);
  };
};
