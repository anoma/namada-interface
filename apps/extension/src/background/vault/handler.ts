import { Env, Handler, InternalHandler, Message } from "router";
import {
  CheckIsLockedMsg,
  CheckPasswordMsg,
  LockVaultMsg,
  ResetPasswordMsg,
  UnlockVaultMsg,
} from "./messages";

import { VaultService } from "./service";

export const getHandler: (service: VaultService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case CheckIsLockedMsg:
        return handleCheckIsLockedMsg(service)(env, msg as CheckIsLockedMsg);

      case LockVaultMsg:
        return handleLockVaultMsg(service)(env, msg as LockVaultMsg);

      case UnlockVaultMsg:
        return handleUnlockVaultMsg(service)(env, msg as UnlockVaultMsg);

      case CheckPasswordMsg:
        return handleCheckPasswordMsg(service)(env, msg as CheckPasswordMsg);

      case ResetPasswordMsg:
        return handleResetPasswordMsg(service)(env, msg as ResetPasswordMsg);

      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleCheckIsLockedMsg: (
  service: VaultService
) => InternalHandler<CheckIsLockedMsg> = (service) => {
  return () => {
    return service.isLocked();
  };
};

const handleLockVaultMsg: (
  service: VaultService
) => InternalHandler<LockVaultMsg> = (service) => {
  return () => {
    return service.lock();
  };
};

const handleUnlockVaultMsg: (
  service: VaultService
) => InternalHandler<UnlockVaultMsg> = (service) => {
  return async (_, msg) => {
    return await service.unlock(msg.password);
  };
};

const handleCheckPasswordMsg: (
  service: VaultService
) => InternalHandler<CheckPasswordMsg> = (service) => {
  return async (_, msg) => {
    return await service.checkPassword(msg.password);
  };
};

const handleResetPasswordMsg: (
  service: VaultService
) => InternalHandler<ResetPasswordMsg> = (service) => {
  return async (_, msg) => {
    return await service.resetPassword(msg.currentPassword, msg.newPassword);
  };
};
