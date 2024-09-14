import {
  CheckDurabilityMsg,
  QueryAccountsMsg,
  QueryDefaultAccountMsg,
  VerifyArbitraryMsg,
} from "provider/messages";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  AddLedgerAccountMsg,
  DeleteAccountMsg,
  DeriveAccountMsg,
  GenerateMnemonicMsg,
  GetActiveAccountMsg,
  QueryAccountDetailsMsg,
  QueryParentAccountsMsg,
  RenameAccountMsg,
  RevealAccountMnemonicMsg,
  SaveAccountSecretMsg,
  SetActiveAccountMsg,
  ValidateMnemonicMsg,
} from "./messages";
import { KeyRingService } from "./service";

export const getHandler: (service: KeyRingService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GenerateMnemonicMsg:
        return handleGenerateMnemonicMsg(service)(
          env,
          msg as GenerateMnemonicMsg
        );
      case RevealAccountMnemonicMsg:
        return handleRevealAccountMnemonicMsg(service)(
          env,
          msg as RevealAccountMnemonicMsg
        );
      case ValidateMnemonicMsg:
        return handleValidateMnemonicMsg(service)(
          env,
          msg as ValidateMnemonicMsg
        );
      case SaveAccountSecretMsg:
        return handleSaveAccountSecretMsg(service)(
          env,
          msg as SaveAccountSecretMsg
        );
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
      case QueryDefaultAccountMsg:
        return handleQueryDefaultAccountMsg(service)(
          env,
          msg as QueryDefaultAccountMsg
        );
      case QueryParentAccountsMsg:
        return handleQueryParentAccountsMsg(service)(
          env,
          msg as QueryParentAccountsMsg
        );
      case RenameAccountMsg:
        return handleRenameAccountMsg(service)(env, msg as RenameAccountMsg);
      case DeleteAccountMsg:
        return handleDeleteAccountMsg(service)(env, msg as DeleteAccountMsg);
      case CheckDurabilityMsg:
        return handleCheckDurabilityMsg(service)(
          env,
          msg as CheckDurabilityMsg
        );
      case AddLedgerAccountMsg:
        return handleAddLedgerAccountMsg(service)(
          env,
          msg as AddLedgerAccountMsg
        );
      case VerifyArbitraryMsg:
        return handleVerifyAbitraryMsg(service)(env, msg as VerifyArbitraryMsg);
      case QueryAccountDetailsMsg:
        return handleQueryAccountDetails(service)(
          env,
          msg as QueryAccountDetailsMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleAddLedgerAccountMsg: (
  service: KeyRingService
) => InternalHandler<AddLedgerAccountMsg> = (service) => {
  return async (_, msg) => {
    const { alias, address, publicKey, bip44Path } = msg;
    return await service.saveLedger(alias, address, publicKey, bip44Path);
  };
};

const handleGenerateMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<GenerateMnemonicMsg> = (service) => {
  return async (_, msg) => {
    return await service.generateMnemonic(msg.size);
  };
};

const handleRevealAccountMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<RevealAccountMnemonicMsg> = (service) => {
  return async (_, msg) => {
    return await service.revealAccountMnemonic(msg.accountId);
  };
};

const handleValidateMnemonicMsg: (
  service: KeyRingService
) => InternalHandler<ValidateMnemonicMsg> = (service) => {
  return async (_, msg) => {
    return service.validateMnemonic(msg.phrase);
  };
};

const handleSaveAccountSecretMsg: (
  service: KeyRingService
) => InternalHandler<SaveAccountSecretMsg> = (service) => {
  return async (_, msg) => {
    const { accountSecret, alias } = msg;
    if (accountSecret) {
      return await service.saveAccountSecret(accountSecret, alias);
    }
    return false;
  };
};

const handleRenameAccountMsg: (
  service: KeyRingService
) => InternalHandler<RenameAccountMsg> = (service) => {
  return async (_, msg) => {
    const { accountId, alias } = msg;
    return await service.renameAccount(accountId, alias);
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
      query && query.accountId ?
        await service.queryAccountById(query.accountId)
      : await service.queryAccounts();

    return output;
  };
};

const handleQueryDefaultAccountMsg: (
  service: KeyRingService
) => InternalHandler<QueryDefaultAccountMsg> = (service) => {
  return async () => {
    return await service.queryDefaultAccount();
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

const handleDeleteAccountMsg: (
  service: KeyRingService
) => InternalHandler<DeleteAccountMsg> = (service) => {
  return async (_, msg) => {
    return await service.deleteAccount(msg.accountId);
  };
};

const handleCheckDurabilityMsg: (
  service: KeyRingService
) => InternalHandler<CheckDurabilityMsg> = (service) => {
  return async (_, _msg) => {
    return await service.checkDurability();
  };
};

const handleVerifyAbitraryMsg: (
  service: KeyRingService
) => InternalHandler<VerifyArbitraryMsg> = (service) => {
  return async (_, { publicKey, hash, signature }) => {
    return await service.verifyArbitrary(publicKey, hash, signature);
  };
};

const handleQueryAccountDetails: (
  service: KeyRingService
) => InternalHandler<QueryAccountDetailsMsg> = (service) => {
  return async (_, { address }) => {
    return await service.queryAccountDetails(address);
  };
};
