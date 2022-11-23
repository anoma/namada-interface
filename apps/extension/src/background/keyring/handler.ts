import { Handler, Env, Message, InternalHandler } from "router";
import { KeyRingService } from "./service";
import {
  CheckIsLockedMsg,
  CheckPasswordMsg,
  DeriveAccountMsg,
  GenerateMnemonicMsg,
  LockKeyRingMsg,
  SaveMnemonicMsg,
  UnlockKeyRingMsg,
} from "./messages";
import {
  EncodeTransferMsg,
  EncodeIbcTransferMsg,
  EncodeInitAccountMsg,
  QueryAccountsMsg,
  SignTxMsg,
} from "provider/messages";

export const getHandler: (service: KeyRingService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case CheckIsLockedMsg:
        return handleCheckIsLockedMsg(service)(env, msg as CheckIsLockedMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(service)(env, msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(service)(env, msg as UnlockKeyRingMsg);
      case CheckPasswordMsg:
        return handleCheckPasswordMsg(service)(env, msg as CheckPasswordMsg);
      case GenerateMnemonicMsg:
        return handleGenerateMnemonicMsg(service)(
          env,
          msg as GenerateMnemonicMsg
        );
      case SaveMnemonicMsg:
        return handleSaveMnemonicMsg(service)(env, msg as SaveMnemonicMsg);
      case DeriveAccountMsg:
        return handleDeriveAccountMsg(service)(env, msg as DeriveAccountMsg);
      case QueryAccountsMsg:
        return handleQueryAccountsMsg(service)(env, msg as QueryAccountsMsg);
      case SignTxMsg:
        return handleSignTxMsg(service)(env, msg as SignTxMsg);
      case EncodeTransferMsg:
        return handleEncodeTransferMsg(service)(env, msg as EncodeTransferMsg);
      case EncodeIbcTransferMsg:
        return handleEncodeIbcTransferMsg(service)(
          env,
          msg as EncodeIbcTransferMsg
        );
      case EncodeInitAccountMsg:
        return handleEncodeInitAccountMsg(service)(
          env,
          msg as EncodeInitAccountMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleCheckIsLockedMsg: (
  service: KeyRingService
) => InternalHandler<CheckIsLockedMsg> = (service) => {
  return () => {
    return service.isLocked();
  };
};

const handleLockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  return () => {
    return service.lock();
  };
};

const handleUnlockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UnlockKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.unlock(msg.password);
  };
};

const handleCheckPasswordMsg: (
  service: KeyRingService
) => InternalHandler<CheckPasswordMsg> = (service) => {
  return async (_, msg) => {
    return await service.checkPassword(msg.password);
  };
};

const handleGenerateMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<GenerateMnemonicMsg> = (service) => {
  return async (_, msg) => {
    return await service.generateMnemonic(msg.size);
  };
};

const handleSaveMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<SaveMnemonicMsg> = (service) => {
  return async (_, msg) => {
    const { words, password, alias } = msg;
    if (words && password) {
      return await service.saveMnemonic(words, password, alias);
    }
    return false;
  };
};

const handleDeriveAccountMsg: (
  service: KeyRingService
) => InternalHandler<DeriveAccountMsg> = (service) => {
  return async (_, msg) => {
    const { path, accountType, alias } = msg;
    return await service.deriveAccount(path, accountType, alias);
  };
};

const handleQueryAccountsMsg: (
  service: KeyRingService
) => InternalHandler<QueryAccountsMsg> = (service) => {
  return async (_, _msg) => {
    return await service.queryAccounts();
  };
};

const handleSignTxMsg: (
  service: KeyRingService
) => InternalHandler<SignTxMsg> = (service) => {
  return async (_, msg) => {
    const { signer, txMsg, txData } = msg;
    return await service.signTx(signer, txMsg, txData);
  };
};

const handleEncodeTransferMsg: (
  service: KeyRingService
) => InternalHandler<EncodeTransferMsg> = (service) => {
  return (_, msg) => {
    const { txMsg } = msg;
    return service.encodeTransfer(txMsg);
  };
};

const handleEncodeIbcTransferMsg: (
  service: KeyRingService
) => InternalHandler<EncodeIbcTransferMsg> = (service) => {
  return (_, msg) => {
    const { txMsg } = msg;
    return service.encodeIbcTransfer(txMsg);
  };
};

const handleEncodeInitAccountMsg: (
  service: KeyRingService
) => InternalHandler<EncodeInitAccountMsg> = (service) => {
  return (_, msg) => {
    const { address, txMsg } = msg;
    return service.encodeInitAccount(txMsg, address);
  };
};
