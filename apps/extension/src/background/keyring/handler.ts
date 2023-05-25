import { Handler, Env, Message, InternalHandler } from "router";
import { KeyRingService } from "./service";
import {
  CheckIsLockedMsg,
  CheckPasswordMsg,
  CloseOffscreenDocumentMsg,
  DeriveAccountMsg,
  GenerateMnemonicMsg,
  LockKeyRingMsg,
  SaveMnemonicMsg,
  UnlockKeyRingMsg,
  SetActiveAccountMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
  TransferCompletedEvent,
} from "./messages";
import {
  ConnectInterfaceMsg,
  SubmitTransferMsg,
  EncodeInitAccountMsg,
  QueryAccountsMsg,
  SubmitBondMsg,
  SubmitUnbondMsg,
  SubmitIbcTransferMsg,
} from "provider/messages";

export const getHandler: (service: KeyRingService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case CheckIsLockedMsg:
        return handleCheckIsLockedMsg(service)(env, msg as CheckIsLockedMsg);
      case ConnectInterfaceMsg:
        return handleConnectInterfaceMsg(service)(
          env,
          msg as ConnectInterfaceMsg
        );
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
      case SubmitBondMsg:
        return handleSubmitBondMsg(service)(env, msg as SubmitBondMsg);
      case SubmitUnbondMsg:
        return handleSubmitUnbondMsg(service)(env, msg as SubmitUnbondMsg);
      case SubmitTransferMsg:
        return handleSubmitTransferMsg(service)(env, msg as SubmitTransferMsg);
      case SubmitIbcTransferMsg:
        return handleSubmitIbcTransferMsg(service)(
          env,
          msg as SubmitIbcTransferMsg
        );
      case EncodeInitAccountMsg:
        return handleEncodeInitAccountMsg(service)(
          env,
          msg as EncodeInitAccountMsg
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

      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleConnectInterfaceMsg: (
  service: KeyRingService
) => InternalHandler<ConnectInterfaceMsg> = (service) => {
  return async ({ senderTabId }, { chainId }) => {
    return await service.connect(senderTabId, chainId);
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

const handleQueryParentAccountsMsg: (
  service: KeyRingService
) => InternalHandler<QueryParentAccountsMsg> = (service) => {
  return async (_, _msg) => {
    return await service.queryParentAccounts();
  };
};

const handleSubmitBondMsg: (
  service: KeyRingService
) => InternalHandler<SubmitBondMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg } = msg;
    return await service.submitBond(txMsg);
  };
};

const handleSubmitUnbondMsg: (
  service: KeyRingService
) => InternalHandler<SubmitUnbondMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg } = msg;
    return await service.submitUnbond(txMsg);
  };
};

const handleSubmitTransferMsg: (
  service: KeyRingService
) => InternalHandler<SubmitTransferMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg } = msg;
    return await service.submitTransfer(txMsg);
  };
};

const handleSubmitIbcTransferMsg: (
  service: KeyRingService
) => InternalHandler<SubmitIbcTransferMsg> = (service) => {
  return async (_, msg) => {
    const { txMsg } = msg;
    return await service.submitIbcTransfer(txMsg);
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

const handleSetActiveAccountMsg: (
  service: KeyRingService
) => InternalHandler<SetActiveAccountMsg> = (service) => {
  return async (_, msg) => {
    const { accountId } = msg;
    return await service.setActiveAccountId(accountId);
  };
};

const handleGetActiveAccountMsg: (
  service: KeyRingService
) => InternalHandler<GetActiveAccountMsg> = (service) => {
  return async (_, _msg) => {
    return await service.getActiveAccountId();
  };
};

const handleTransferCompletedEvent: (
  service: KeyRingService
) => InternalHandler<TransferCompletedEvent> = (service) => {
  return async (_, msg) => {
    const { msgId } = msg;
    return await service.handleTransferCompleted(msgId);
  };
};

const handleCloseOffscreenDocumentMsg: (
  service: KeyRingService
) => InternalHandler<CloseOffscreenDocumentMsg> = (service) => {
  return async () => {
    return await service.closeOffscreenDocument();
  };
};
