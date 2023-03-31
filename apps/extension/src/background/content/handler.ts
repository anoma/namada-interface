import { Env, Handler, InternalHandler, Message } from "router";
import { TransferCompletedMsg } from "./messages";
import { ContentService } from "./service";

export const getHandler: (service: ContentService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case TransferCompletedMsg:
        return handleTransferCompletedMsg(service)(
          env,
          msg as TransferCompletedMsg
        );
    }
  };
};

const handleTransferCompletedMsg: (
  service: ContentService
) => InternalHandler<TransferCompletedMsg> = (service) => {
  return async (_, msg) => {
    const { success } = msg;
    return service.handleTransferCompleted(success);
  };
};
