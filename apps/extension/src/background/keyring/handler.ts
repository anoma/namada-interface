import { Handler, Env, Message, InternalHandler } from "router";
import { KeyRingService } from "./service";
import {
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  CheckPasswordMsg,
  GenerateMnemonicMsg,
  SaveMnemonicMsg,
} from "./messages";

export const getHandler: (service: KeyRingService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
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
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleLockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  return async () => {
    return await service.lock();
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
    const { password, words } = msg;
    if (password && words) {
      return await service.saveMnemonic(words, password);
    }
    return false;
  };
};
