import { Handler, Env, Message, InternalHandler } from "router";
import { LedgerService } from "./service";
import {
  AddLedgerAccountMsg,
  GetTxBytesMsg,
  SubmitSignedRevealPKMsg,
  GetRevealPKBytesMsg,
  SubmitSignedTxMsg,
} from "./messages";

export const getHandler: (service: LedgerService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case AddLedgerAccountMsg:
        return handleAddLedgerAccountMsg(service)(
          env,
          msg as AddLedgerAccountMsg
        );
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
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleAddLedgerAccountMsg: (
  service: LedgerService
) => InternalHandler<AddLedgerAccountMsg> = (service) => {
  return async (_, msg) => {
    const { alias, address, publicKey, bip44Path } = msg;
    return await service.addAccount(alias, address, publicKey, bip44Path);
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
