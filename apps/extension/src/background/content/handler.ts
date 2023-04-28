import { Env, Handler, InternalHandler, Message } from "router";
import { AccountChangedEvent } from "./messages";
import { ContentService } from "./service";

export const getHandler: (service: ContentService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case AccountChangedEvent:
        return handleAccountChangedMsg(service)(
          env,
          msg as AccountChangedEvent
        );
    }
  };
};

const handleAccountChangedMsg: (
  service: ContentService
) => InternalHandler<AccountChangedEvent> = (service) => {
  return async (_, msg) => {
    const { chainId, senderTabId } = msg;
    return service.handleAccountChanged(chainId, senderTabId);
  };
};
