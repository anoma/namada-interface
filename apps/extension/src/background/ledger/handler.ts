import { Handler, Env, Message, InternalHandler } from "router";
import { LedgerService } from "./service";
import {
  AddLedgerAccountMsg,
  GetBondBytesMsg,
  GetRevealPKBytesMsg,
  GetTransferBytesMsg,
  SubmitSignedTransferMsg,
  SubmitSignedBondMsg,
  SubmitSignedRevealPKMsg,
} from "./messages";

export const getHandler: (service: LedgerService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case AddLedgerAccountMsg:
        return handleAddLedgerAccountMsg(service)(
          env,
          msg as AddLedgerAccountMsg
        );
      case GetRevealPKBytesMsg:
        return handleGetRevealPKBytesMsg(service)(
          env,
          msg as GetRevealPKBytesMsg
        );

      case GetTransferBytesMsg:
        return handleGetTransferBytesMsg(service)(
          env,
          msg as GetTransferBytesMsg
        );
      case SubmitSignedRevealPKMsg:
        return handleSubmitSignedRevealPKMsg(service)(
          env,
          msg as SubmitSignedRevealPKMsg
        );
      case SubmitSignedTransferMsg:
        return handleSubmitSignedTransferMsg(service)(
          env,
          msg as SubmitSignedTransferMsg
        );
      case GetBondBytesMsg:
        return handleGetBondBytesMsg(service)(env, msg as GetTransferBytesMsg);
      case SubmitSignedBondMsg:
        return handleSubmitSignedBondMsg(service)(
          env,
          msg as SubmitSignedBondMsg
        );

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

const handleGetTransferBytesMsg: (
  service: LedgerService
) => InternalHandler<GetTransferBytesMsg> = (service) => {
  return async (_, msg) => {
    const { msgId } = msg;
    return await service.getTransferBytes(msgId);
  };
};

const handleSubmitSignedTransferMsg: (
  service: LedgerService
) => InternalHandler<SubmitSignedTransferMsg> = (service) => {
  return async (_, msg) => {
    const { bytes, msgId, signatures } = msg;
    return await service.submitTransfer(msgId, bytes, signatures);
  };
};

const handleGetBondBytesMsg: (
  service: LedgerService
) => InternalHandler<GetBondBytesMsg> = (service) => {
  return async (_, msg) => {
    const { msgId } = msg;
    return await service.getBondBytes(msgId);
  };
};

const handleSubmitSignedBondMsg: (
  service: LedgerService
) => InternalHandler<SubmitSignedBondMsg> = (service) => {
  return async (_, msg) => {
    const { bytes, msgId, signatures } = msg;
    return await service.submitBond(msgId, bytes, signatures);
  };
};

const handleGetRevealPKBytesMsg: (
  service: LedgerService
) => InternalHandler<GetRevealPKBytesMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg } = msg;
    return await service.getBondBytes(txMsg);
  };
};

const handleSubmitSignedRevealPKMsg: (
  service: LedgerService
) => InternalHandler<SubmitSignedRevealPKMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg, bytes, signatures } = msg;
    return await service.submitBond(txMsg, bytes, signatures);
  };
};
