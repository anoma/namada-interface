import { Handler, Env, Message, InternalHandler } from "router";
import { ApprovalsService } from "./service";
import { SubmitApproveTxMsg } from "./messages";

export const getHandler: (service: ApprovalsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SubmitApproveTxMsg:
        return handleSubmitApproveTxMsg(service)(
          env,
          msg as SubmitApproveTxMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleSubmitApproveTxMsg: (
  service: ApprovalsService
) => InternalHandler<SubmitApproveTxMsg> = (service) => {
  return async (_, { txMsg }) => {
    return await service.submitTx(txMsg);
  };
};
