import { Env, Handler, InternalHandler, Message } from "router";
import { TransferCompletedEvent } from "./messages";
import { ContentService } from "./service";

export const getHandler: (service: ContentService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case TransferCompletedEvent:
        return handleTransferCompletedMsg(service)(
          env,
          msg as TransferCompletedEvent
        );
    }
  };
};

const handleTransferCompletedMsg: (
  service: ContentService
) => InternalHandler<TransferCompletedEvent> = (service) => {
  return async (_, msg) => {
    const { success, msgId } = msg;
    return service.handleTransferCompleted(success, msgId);
  };
};
