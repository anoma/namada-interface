import { PhraseSize } from "@namada/crypto";
import { AccountType, Bip44Path, DerivedAccount } from "@namada/types";
import { Result } from "@namada/utils";
import { Message } from "router";
import { validatePrivateKey, validateProps } from "utils";
import { ROUTE } from "./constants";
import {
  AccountSecret,
  AccountStore,
  DeleteAccountError,
  MnemonicValidationResponse,
  ParentAccount,
} from "./types";

enum MessageType {
  QueryPublicKey = "query-public-key",
  CloseOffscreenDocument = "close-offscreen-document",
  DeriveAccount = "derive-account",
  DeriveShieldedAccount = "derive-shielded-account",
  GenerateMnemonic = "generate-mnemonic",
  GetActiveAccount = "get-active-account",
  QueryParentAccounts = "query-parent-accounts",
  SaveAccountSecret = "save-account-secret",
  ScanAccounts = "scan-accounts",
  SetActiveAccount = "set-active-account",
  TransferCompletedEvent = "transfer-completed-event",
  DeleteAccount = "delete-account",
  ValidateMnemonic = "validate-mnemonic",
  AddLedgerAccount = "add-ledger-account",
  RevealAccountMnemonic = "reveal-account-mnemonic",
  RenameAccount = "rename-account",
}

export class QueryPublicKeyMsg extends Message<string | undefined> {
  public static type(): MessageType {
    return MessageType.QueryPublicKey;
  }

  constructor(public readonly address: string) {
    super();
  }

  validate(): void {
    if (!this.address) {
      throw new Error("address not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryPublicKeyMsg.type();
  }
}

export class GenerateMnemonicMsg extends Message<string[]> {
  public static type(): MessageType {
    return MessageType.GenerateMnemonic;
  }

  constructor(public readonly size?: PhraseSize) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GenerateMnemonicMsg.type();
  }
}

export class RevealAccountMnemonicMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.RevealAccountMnemonic;
  }

  constructor(public readonly accountId: string) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RevealAccountMnemonicMsg.type();
  }
}

export class ValidateMnemonicMsg extends Message<MnemonicValidationResponse> {
  public static type(): MessageType {
    return MessageType.ValidateMnemonic;
  }

  constructor(public readonly phrase: string) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ValidateMnemonicMsg.type();
  }
}

export class RenameAccountMsg extends Message<DerivedAccount> {
  public static type(): MessageType {
    return MessageType.RenameAccount;
  }

  constructor(
    public readonly accountId: string,
    public readonly alias: string
  ) {
    super();
  }

  validate(): void {
    if (this.alias.length === 0) {
      throw new Error("Invalid account name");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RenameAccountMsg.type();
  }
}

export class SaveAccountSecretMsg extends Message<AccountStore | false> {
  public static type(): MessageType {
    return MessageType.SaveAccountSecret;
  }

  constructor(
    public readonly accountSecret: AccountSecret,
    public readonly alias: string
  ) {
    super();
  }

  validate(): void {
    if (!this.accountSecret) {
      throw new Error("A wordlist or private key is required!");
    }

    switch (this.accountSecret.t) {
      case "Mnemonic":
        if (
          this.accountSecret.seedPhrase.length !== PhraseSize.N12 &&
          this.accountSecret.seedPhrase.length !== PhraseSize.N24
        ) {
          throw new Error("Invalid wordlist length! Not a valid mnemonic.");
        }
        break;

      case "PrivateKey":
        if (!validatePrivateKey(this.accountSecret.privateKey).ok) {
          throw new Error("Invalid private key!");
        }
        break;

      default:
        throw new Error("Unknown account secret type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SaveAccountSecretMsg.type();
  }
}

export class AddLedgerAccountMsg extends Message<AccountStore | false> {
  public static type(): MessageType {
    return MessageType.AddLedgerAccount;
  }

  constructor(
    public readonly alias: string,
    public readonly address: string,
    public readonly publicKey: string,
    public readonly bip44Path: Bip44Path,
    public readonly parentId?: string
  ) {
    super();
  }

  validate(): void {
    if (!this.alias) {
      throw new Error("Alias must not be empty!");
    }

    if (!this.address) {
      throw new Error("Address was not provided!");
    }

    if (!this.publicKey) {
      throw new Error("Public key was not provided!");
    }

    if (!this.bip44Path) {
      throw new Error("BIP44 Path was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddLedgerAccountMsg.type();
  }
}
export class ScanAccountsMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ScanAccounts;
  }

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validate(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ScanAccountsMsg.type();
  }
}

export class DeriveAccountMsg extends Message<DerivedAccount> {
  public static type(): MessageType {
    return MessageType.DeriveAccount;
  }

  constructor(
    public readonly path: Bip44Path,
    public readonly accountType: AccountType,
    public readonly alias: string
  ) {
    super();
  }

  validate(): void {
    if (!this.accountType) {
      throw new Error("An account type is required!");
    }
    if (!this.path) {
      throw new Error("A Bip44Path object must be provided!");
    }

    const { account, change } = this.path;

    if (!`${account}`) {
      throw new Error("A Bip44Path account path was not provided!");
    }

    if (!`${change}`) {
      throw new Error("A Bip44Path change path was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeriveAccountMsg.type();
  }
}

export class SetActiveAccountMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SetActiveAccount;
  }

  constructor(
    public readonly accountId: string,
    public readonly accountType: ParentAccount
  ) {
    super();
  }

  validate(): void {
    if (!this.accountId) {
      throw new Error("Account ID is not set!");
    }

    if (!this.accountType) {
      throw new Error("Account Type is required!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetActiveAccountMsg.type();
  }
}

export class GetActiveAccountMsg extends Message<
  { id: string; type: ParentAccount } | undefined
> {
  public static type(): MessageType {
    return MessageType.GetActiveAccount;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetActiveAccountMsg.type();
  }
}

export class QueryParentAccountsMsg extends Message<DerivedAccount[]> {
  public static type(): MessageType {
    return MessageType.QueryParentAccounts;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryParentAccountsMsg.type();
  }
}

export class CloseOffscreenDocumentMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.CloseOffscreenDocument;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CloseOffscreenDocumentMsg.type();
  }
}

export class TransferCompletedEvent extends Message<void> {
  public static type(): MessageType {
    return MessageType.TransferCompletedEvent;
  }

  constructor(
    public readonly success: boolean,
    public readonly msgId: string,
    public readonly payload: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["success", "msgId", "payload"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return TransferCompletedEvent.type();
  }
}

export class DeleteAccountMsg extends Message<
  Result<null, DeleteAccountError>
> {
  public static type(): MessageType {
    return MessageType.DeleteAccount;
  }

  constructor(public accountId: string) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeleteAccountMsg.type();
  }
}
