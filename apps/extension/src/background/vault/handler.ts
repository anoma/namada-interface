import { Env, Handler, InternalHandler, Message } from "router";
import {
  CheckIsLockedMsg,
  CheckPasswordMsg,
  LockVaultMsg,
  ResetPasswordMsg,
  UnlockVaultMsg,
  CheckPasswordInitializedMsg,
  CreatePasswordMsg,
  LogoutMsg,
} from "./messages";

import { VaultService } from "./service";

export const getHandler: (service: VaultService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case CheckIsLockedMsg:
        return handleCheckIsLockedMsg(service)(env, msg as CheckIsLockedMsg);

      case LockVaultMsg:
        return handleLockVaultMsg(service)(env, msg as LockVaultMsg);

      case LogoutMsg:
        return handleLogoutMsg(service)(env, msg as LockVaultMsg);

      case UnlockVaultMsg:
        return handleUnlockVaultMsg(service)(env, msg as UnlockVaultMsg);

      case CheckPasswordMsg:
        return handleCheckPasswordMsg(service)(env, msg as CheckPasswordMsg);

      case ResetPasswordMsg:
        return handleResetPasswordMsg(service)(env, msg as ResetPasswordMsg);

      case CheckPasswordInitializedMsg:
        return handleCheckPasswordInitializedMsg(service)(
          env,
          msg as CheckPasswordInitializedMsg
        );

      case CreatePasswordMsg:
        return handleCreatePasswordMsg(service)(env, msg as CreatePasswordMsg);

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

const handleLogoutMsg: (service: VaultService) => InternalHandler<LogoutMsg> = (
  service
) => {
  return async (_) => {
    return await service.logout();
  };
};

const handleCheckPasswordInitializedMsg: (
  service: VaultService
) => InternalHandler<CheckPasswordInitializedMsg> = (service) => {
  return async (_, _msg) => {
    return await service.passwordInitialized();
  };
};

const handleCreatePasswordMsg: (
  service: VaultService
) => InternalHandler<CreatePasswordMsg> = (service) => {
  return async (_, msg) => {
    return await service.createPassword(msg.password);
  };
};
