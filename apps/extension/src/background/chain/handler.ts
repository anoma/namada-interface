import { Env, Handler, InternalHandler, Message } from "router";
import { GetChainMsg, UpdateChainMsg } from "./messages";
import { ChainService } from "./service";

export const getHandler: (service: ChainService) => Handler = (service) => {
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
  service: ChainService
) => InternalHandler<GetChainMsg> = (service) => {
  return async () => {
    return await service.getChain();
  };
};

const handleUpdateChainMsg: (
  service: ChainService
) => InternalHandler<UpdateChainMsg> = (service) => {
  return async (_, { chainId }) => {
    return await service.updateChain(chainId);
  };
};
