import { Handler, Env, Message, InternalHandler } from "router";
import { LedgerService } from "./service";
import {
  AddLedgerAccountMsg,
  GetBondBytesMsg,
  GetTransferBytesMsg,
  SubmitSignedTransferMsg,
  SubmitSignedBondMsg,
} from "./messages";

export const getHandler: (service: LedgerService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case AddLedgerAccountMsg:
        return handleAddLedgerAccountMsg(service)(
          env,
          msg as AddLedgerAccountMsg
        );
      case GetTransferBytesMsg:
        return handleGetTransferBytesMsg(service)(
          env,
          msg as GetTransferBytesMsg
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
