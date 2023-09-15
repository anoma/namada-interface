import { Handler, Env, Message, InternalHandler } from "router";
import { KeyRingService } from "./service";
import {
  CheckIsLockedMsg,
  CheckPasswordMsg,
  QueryPublicKeyMsg,
  CloseOffscreenDocumentMsg,
  ResetPasswordMsg,
  DeriveAccountMsg,
  GenerateMnemonicMsg,
  LockKeyRingMsg,
  SaveMnemonicMsg,
  UnlockKeyRingMsg,
  SetActiveAccountMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
  TransferCompletedEvent,
  DeleteAccountMsg,
  ValidateMnemonicMsg,
  ScanAccountsMsg,
} from "./messages";
import {
  QueryAccountsMsg,
  QueryBalancesMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
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
      case QueryPublicKeyMsg:
        return handleQueryPublicKey(service)(env, msg as QueryPublicKeyMsg);
      case ResetPasswordMsg:
        return handleResetPasswordMsg(service)(env, msg as ResetPasswordMsg);
      case GenerateMnemonicMsg:
        return handleGenerateMnemonicMsg(service)(
          env,
          msg as GenerateMnemonicMsg
        );
      case ValidateMnemonicMsg:
        return handleValidateMnemonicMsg(service)(
          env,
          msg as ValidateMnemonicMsg
        );
      case SaveMnemonicMsg:
        return handleSaveMnemonicMsg(service)(env, msg as SaveMnemonicMsg);
      case ScanAccountsMsg:
        return handleScanAccountsMsg(service)(env, msg as ScanAccountsMsg);
      case DeriveAccountMsg:
        return handleDeriveAccountMsg(service)(env, msg as DeriveAccountMsg);
      case QueryAccountsMsg:
        return handleQueryAccountsMsg(service)(env, msg as QueryAccountsMsg);
      case QueryBalancesMsg:
        return handleQueryBalancesMsg(service)(env, msg as QueryBalancesMsg);
      case SetActiveAccountMsg:
        return handleSetActiveAccountMsg(service)(
          env,
          msg as SetActiveAccountMsg
        );
      case GetActiveAccountMsg:
        return handleGetActiveAccountMsg(service)(
          env,
          msg as GetActiveAccountMsg
        );
      case QueryParentAccountsMsg:
        return handleQueryParentAccountsMsg(service)(
          env,
          msg as QueryParentAccountsMsg
        );
      case CloseOffscreenDocumentMsg:
        return handleCloseOffscreenDocumentMsg(service)(
          env,
          msg as CloseOffscreenDocumentMsg
        );
      case TransferCompletedEvent:
        return handleTransferCompletedEvent(service)(
          env,
          msg as TransferCompletedEvent
        );
      case DeleteAccountMsg:
        return handleDeleteAccountMsg(service)(env, msg as DeleteAccountMsg);
      case FetchAndStoreMaspParamsMsg:
        return handleFetchAndStoreMaspParamsMsg(service)(
          env,
          msg as FetchAndStoreMaspParamsMsg
        );
      case HasMaspParamsMsg:
        return handleHasMaspParamsMsg(service)(env, msg as HasMaspParamsMsg);
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

const handleQueryPublicKey: (
  service: KeyRingService
) => InternalHandler<QueryPublicKeyMsg> = (service) => {
  return async (_, msg) => {
    const { address } = msg;
    return await service.queryPublicKey(address);
  };
};

const handleResetPasswordMsg: (
  service: KeyRingService
) => InternalHandler<ResetPasswordMsg> = (service) => {
  return async (_, msg) => {
    return await service.resetPassword(
      msg.currentPassword,
      msg.newPassword,
      msg.accountId
    );
  };
};

const handleGenerateMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<GenerateMnemonicMsg> = (service) => {
  return async (_, msg) => {
    return await service.generateMnemonic(msg.size);
  };
};

const handleValidateMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<ValidateMnemonicMsg> = (service) => {
  return async (_, msg) => {
    return service.validateMnemonic(msg.phrase);
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

const handleScanAccountsMsg: (
  service: KeyRingService
) => InternalHandler<ScanAccountsMsg> = (service) => {
  return async () => {
    await service.scanAccounts();
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

const handleQueryBalancesMsg: (
  service: KeyRingService
) => InternalHandler<QueryBalancesMsg> = (service) => {
  return async (_, msg) => {
    return await service.queryBalances(msg.owner);
  };
};

const handleQueryParentAccountsMsg: (
  service: KeyRingService
) => InternalHandler<QueryParentAccountsMsg> = (service) => {
  return async (_, _msg) => {
    return await service.queryParentAccounts();
  };
};

const handleSetActiveAccountMsg: (
  service: KeyRingService
) => InternalHandler<SetActiveAccountMsg> = (service) => {
  return async (_, msg) => {
    const { accountId, accountType } = msg;
    return await service.setActiveAccount(accountId, accountType);
  };
};

const handleGetActiveAccountMsg: (
  service: KeyRingService
) => InternalHandler<GetActiveAccountMsg> = (service) => {
  return async (_, _msg) => {
    return await service.getActiveAccount();
  };
};

const handleTransferCompletedEvent: (
  service: KeyRingService
) => InternalHandler<TransferCompletedEvent> = (service) => {
  return async (_, msg) => {
    const { msgId, success, payload } = msg;
    return await service.handleTransferCompleted(msgId, success, payload);
  };
};

const handleCloseOffscreenDocumentMsg: (
  service: KeyRingService
) => InternalHandler<CloseOffscreenDocumentMsg> = (service) => {
  return async () => {
    return await service.closeOffscreenDocument();
  };
};

const handleDeleteAccountMsg: (
  service: KeyRingService
) => InternalHandler<DeleteAccountMsg> = (service) => {
  return async (_, msg) => {
    return await service.deleteAccount(msg.accountId, msg.password);
  };
};

const handleFetchAndStoreMaspParamsMsg: (
  service: KeyRingService
) => InternalHandler<FetchAndStoreMaspParamsMsg> = (service) => {
  return async (_, _msg) => {
    return await service.fetchAndStoreMaspParams();
  };
};

const handleHasMaspParamsMsg: (
  service: KeyRingService
) => InternalHandler<HasMaspParamsMsg> = (service) => {
  return async (_, _msg) => {
    return await service.hasMaspParams();
  };
};
