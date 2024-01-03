import { GetChainMsg, GetChainsMsg } from "provider/messages";
import { Env, Handler, InternalHandler, Message } from "router";
import { ChainsService } from "./service";

export const getHandler: (service: ChainsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainMsg:
        return handleGetChainMsg(service)(env, msg as GetChainMsg);
      case GetChainsMsg:
        return handleGetChainsMsg(service)(env, msg as GetChainsMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetChainsMsg: (
  service: ChainsService
) => InternalHandler<GetChainsMsg> = (service) => {
  return async () => {
    return await service.getChains();
  };
};

const handleGetChainMsg: (
  service: ChainsService
) => InternalHandler<GetChainMsg> = (service) => {
  return async (_, msg) => {
    return await service.getChain(msg.chainId);
  };
};
