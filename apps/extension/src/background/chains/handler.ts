import { GetChainMsg } from "provider/messages";
import { Env, Handler, InternalHandler, Message } from "router";
import { UpdateChainMsg } from "./messages";
import { ChainsService } from "./service";

export const getHandler: (service: ChainsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainMsg:
        return handleGetChainMsg(service)(env, msg as GetChainMsg);
      case UpdateChainMsg:
        return handleUpdateChainMsg(service)(env, msg as UpdateChainMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetChainMsg: (
  service: ChainsService
) => InternalHandler<GetChainMsg> = (service) => {
  return async () => {
    return await service.getChain();
  };
};

const handleUpdateChainMsg: (
  service: ChainsService
) => InternalHandler<UpdateChainMsg> = (service) => {
  return async (_, { chainId, url }) => {
    return await service.updateChain(chainId, url);
  };
};
