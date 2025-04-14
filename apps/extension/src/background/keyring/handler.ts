import {
  CheckDurabilityMsg,
  ClearDisposableSignerMsg,
  GenDisposableSignerMsg,
  PersistDisposableSignerMsg,
  QueryAccountsMsg,
  QueryDefaultAccountMsg,
  VerifyArbitraryMsg,
} from "provider/messages";
import { Env, Handler, InternalHandler, Message } from "router";
import {
  AddLedgerAccountMsg,
  DeleteAccountMsg,
  DeriveShieldedAccountMsg,
  GenerateMnemonicMsg,
  GenPaymentAddressMsg,
  GetActiveAccountMsg,
  QueryAccountDetailsMsg,
  QueryParentAccountsMsg,
  RenameAccountMsg,
  RevealAccountMnemonicMsg,
  RevealPrivateKeyMsg,
  RevealSpendingKeyMsg,
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
      case DeriveShieldedAccountMsg:
        return handleDeriveShieldedAccountMsg(service)(
          env,
          msg as DeriveShieldedAccountMsg
        );
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
      case GenDisposableSignerMsg:
        return handleGenDisposableSignerMsg(service)(
          env,
          msg as GenDisposableSignerMsg
        );
      case PersistDisposableSignerMsg:
        return handlePersistDisposableSignerMsg(service)(
          env,
          msg as PersistDisposableSignerMsg
        );
      case ClearDisposableSignerMsg:
        return handleClearDisposableSignerMsg(service)(
          env,
          msg as ClearDisposableSignerMsg
        );
      case RevealSpendingKeyMsg:
        return handleRevealSpendingKeyMsg(service)(
          env,
          msg as RevealSpendingKeyMsg
        );
      case GenPaymentAddressMsg:
        return handleGenPaymentAddressMsg(service)(
          env,
          msg as GenPaymentAddressMsg
        );
      case RevealPrivateKeyMsg:
        return handleRevealPrivateKeyMsg(service)(
          env,
          msg as RevealPrivateKeyMsg
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
    const {
      alias,
      address,
      publicKey,
      bip44Path,
      zip32Path,
      extendedViewingKey,
      pseudoExtendedKey,
      paymentAddress,
      diversifierIndex,
    } = msg;
    return await service.saveLedger(
      alias,
      address,
      publicKey,
      bip44Path,
      zip32Path,
      extendedViewingKey,
      pseudoExtendedKey,
      paymentAddress,
      diversifierIndex
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
    const { accountSecret, alias, flow, path } = msg;
    if (accountSecret) {
      return await service.saveAccountSecret(accountSecret, alias, flow, path);
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

const handleDeriveShieldedAccountMsg: (
  service: KeyRingService
) => InternalHandler<DeriveShieldedAccountMsg> = (service) => {
  return async (_, msg) => {
    const { path, accountType, alias, parentId, source } = msg;
    return await service.deriveShieldedAccount(
      path,
      accountType,
      alias,
      parentId,
      source
    );
  };
};

const handleQueryAccountsMsg: (
  service: KeyRingService
) => InternalHandler<QueryAccountsMsg> = (service) => {
  return async (_, msg) => {
    const { query } = msg;

    const output =
      query && query.accountId ?
        await service.queryAccountsByParentId(query.accountId)
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

const handleGenDisposableSignerMsg: (
  service: KeyRingService
) => InternalHandler<GenDisposableSignerMsg> = (service) => {
  return async (_, _msg) => {
    return await service.genDisposableSigner();
  };
};

const handlePersistDisposableSignerMsg: (
  service: KeyRingService
) => InternalHandler<PersistDisposableSignerMsg> = (service) => {
  return async (_, { address }) => {
    return await service.persistDisposableSigner(address);
  };
};

const handleClearDisposableSignerMsg: (
  service: KeyRingService
) => InternalHandler<ClearDisposableSignerMsg> = (service) => {
  return async (_, { address }) => {
    return await service.clearDisposableSigner(address);
  };
};

const handleRevealSpendingKeyMsg: (
  service: KeyRingService
) => InternalHandler<RevealSpendingKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.revealSpendingKey(msg.accountId);
  };
};

const handleGenPaymentAddressMsg: (
  service: KeyRingService
) => InternalHandler<GenPaymentAddressMsg> = (service) => {
  return async (_, { accountId }) => {
    return await service.genPaymentAddress(accountId);
  };
};

const handleRevealPrivateKeyMsg: (
  service: KeyRingService
) => InternalHandler<RevealPrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.revealPrivateKey(msg.accountId);
  };
};
