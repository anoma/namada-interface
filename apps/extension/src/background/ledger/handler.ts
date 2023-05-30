import { Handler, Env, Message, InternalHandler } from "router";
import { LedgerService } from "./service";
import {
  AddLedgerAccountMsg,
  GetTransferBytesMsg,
  SubmitSignedTransferMsg,
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
    const { bytes, publicKey, msgId, signatures } = msg;
    return await service.submitTransfer(msgId, bytes, signatures, publicKey);
  };
};
