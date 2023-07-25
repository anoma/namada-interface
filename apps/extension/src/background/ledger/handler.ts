import { Handler, Env, Message, InternalHandler } from "router";
import { LedgerService } from "./service";
import {
  AddLedgerAccountMsg,
  GetTxBytesMsg,
  SubmitSignedTransferMsg,
  SubmitSignedBondMsg,
  SubmitSignedRevealPKMsg,
  GetRevealPKBytesMsg,
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
      case SubmitSignedTransferMsg:
        return handleSubmitSignedTransferMsg(service)(
          env,
          msg as SubmitSignedTransferMsg
        );
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

const handleSubmitSignedTransferMsg: (
  service: LedgerService
) => InternalHandler<SubmitSignedTransferMsg> = (service) => {
  return async (_, msg) => {
    const { bytes, msgId, signatures } = msg;
    return await service.submitTransfer(msgId, bytes, signatures);
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
