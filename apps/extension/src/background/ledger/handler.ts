import { Handler, Env, Message, InternalHandler } from "router";
import { LedgerService } from "./service";
import {
  GetTxBytesMsg,
  SubmitSignedRevealPKMsg,
  GetRevealPKBytesMsg,
  SubmitSignedTxMsg,
  QueryStoredPK,
  StoreRevealedPK,
} from "./messages";

export const getHandler: (service: LedgerService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetTxBytesMsg:
        return handleGetTxBytesMsg(service)(env, msg as GetTxBytesMsg);
      case GetRevealPKBytesMsg:
        return handleGetRevealPKBytesMsg(service)(env, msg as GetTxBytesMsg);
      case SubmitSignedRevealPKMsg:
        return handleSubmitSignedRevealPKMsg(service)(
          env,
          msg as SubmitSignedRevealPKMsg
        );
      case SubmitSignedTxMsg:
        return handleSubmitSignedTxMsg(service)(env, msg as SubmitSignedTxMsg);
      case QueryStoredPK:
        return handleQueryStoredPKMsg(service)(env, msg as QueryStoredPK);
      case StoreRevealedPK:
        return handleStoreRevealedPK(service)(env, msg as StoreRevealedPK);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetTxBytesMsg: (
  service: LedgerService
) => InternalHandler<GetTxBytesMsg> = (service) => {
  return async (_, msg) => {
    const { address, txType, txMsg } = msg;
    return await service.getTxBytes(txType, txMsg, address);
  };
};

const handleGetRevealPKBytesMsg: (
  service: LedgerService
) => InternalHandler<GetRevealPKBytesMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg } = msg;
    return await service.getRevealPKBytes(txMsg);
  };
};

const handleSubmitSignedRevealPKMsg: (
  service: LedgerService
) => InternalHandler<SubmitSignedRevealPKMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg, bytes, signatures } = msg;
    return await service.submitRevealPk(txMsg, bytes, signatures);
  };
};

const handleSubmitSignedTxMsg: (
  service: LedgerService
) => InternalHandler<SubmitSignedTxMsg> = (service) => {
  return async (_, msg) => {
    const { txType, bytes, msgId, signatures } = msg;
    return await service.submitTx(txType, msgId, bytes, signatures);
  };
};

const handleQueryStoredPKMsg: (
  service: LedgerService
) => InternalHandler<QueryStoredPK> = (service) => {
  return async (_, msg) => {
    const { publicKey } = msg;
    return await service.queryStoredRevealedPK(publicKey);
  };
};

const handleStoreRevealedPK: (
  service: LedgerService
) => InternalHandler<StoreRevealedPK> = (service) => {
  return async (_, msg) => {
    const { publicKey } = msg;
    return await service.storeRevealedPK(publicKey);
  };
};
