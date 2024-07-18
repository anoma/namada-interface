import { GetChainMsg } from "provider/messages";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  AddTxWasmHashesMsg,
  GetTxWasmHashesMsg,
  UpdateChainMsg,
} from "./messages";
import { ChainsService } from "./service";

export const getHandler: (service: ChainsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainMsg:
        return handleGetChainMsg(service)(env, msg as GetChainMsg);
      case UpdateChainMsg:
        return handleUpdateChainMsg(service)(env, msg as UpdateChainMsg);
      case AddTxWasmHashesMsg:
        return handleAddTxWasmHashesMsg(service)(
          env,
          msg as AddTxWasmHashesMsg
        );
      case GetTxWasmHashesMsg:
        return handleGetTxWasmHashesMsg(service)(
          env,
          msg as GetTxWasmHashesMsg
        );
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
  return async (_, { chainId }) => {
    return await service.updateChain(chainId);
  };
};

const handleAddTxWasmHashesMsg: (
  service: ChainsService
) => InternalHandler<AddTxWasmHashesMsg> = (service) => {
  return async (_, { chainId, wasmHashes }) => {
    return await service.addTxWasmHashes(chainId, wasmHashes);
  };
};

const handleGetTxWasmHashesMsg: (
  service: ChainsService
) => InternalHandler<GetTxWasmHashesMsg> = (service) => {
  return async (_, { chainId }) => {
    return await service.getTxWasmHashes(chainId);
  };
};
