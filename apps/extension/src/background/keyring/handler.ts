import {
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  QueryAccountsMsg,
  QueryBalancesMsg,
} from "provider/messages";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  CloseOffscreenDocumentMsg,
  DeleteAccountMsg,
  DeriveAccountMsg,
  GenerateMnemonicMsg,
  GetActiveAccountMsg,
  QueryParentAccountsMsg,
  QueryPublicKeyMsg,
  SaveMnemonicMsg,
  ScanAccountsMsg,
  SetActiveAccountMsg,
  TransferCompletedEvent,
  ValidateMnemonicMsg,
} from "./messages";
import { KeyRingService } from "./service";

export const getHandler: (service: KeyRingService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case QueryPublicKeyMsg:
        return handleQueryPublicKey(service)(env, msg as QueryPublicKeyMsg);
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
      case CheckDurabilityMsg:
        return handleCheckDurabilityMsg(service)(
          env,
          msg as CheckDurabilityMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
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
    const { words, alias } = msg;
    if (words) {
      return await service.saveMnemonic(words, alias);
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
  return async (_, msg) => {
    const { query } = msg;

    const output =
      query && query.accountId
        ? await service.queryAccountById(query.accountId)
        : await service.queryAccounts();

    return output;
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

const handleCheckDurabilityMsg: (
  service: KeyRingService
) => InternalHandler<CheckDurabilityMsg> = (service) => {
  return async (_, _msg) => {
    return await service.checkDurability();
  };
};
