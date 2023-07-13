import { PhraseSize } from "@anoma/crypto";
import { AccountType, Bip44Path, DerivedAccount } from "@anoma/types";
import { Message } from "router";
import { ROUTE } from "./constants";
import {
  KeyRingStatus,
  ResetPasswordError,
  DeleteAccountError,
  ParentAccount,
} from "./types";
import { Result } from "@anoma/utils";

enum MessageType {
  CheckIsLocked = "check-is-locked",
  CheckPassword = "check-password",
  CheckIsPublicKeyRevealed = "check-is-public-key-revealed",
  CloseOffscreenDocument = "close-offscreen-document",
  DeriveAccount = "derive-account",
  DeriveShieldedAccount = "derive-shielded-account",
  GenerateMnemonic = "generate-mnemonic",
  GetActiveAccount = "get-active-account",
  LockKeyRing = "lock-keyring",
  QueryParentAccounts = "query-parent-accounts",
  ResetPassword = "reset-password",
  SaveMnemonic = "save-mnemonic",
  ScanAccounts = "scan-accounts",
  SetActiveAccount = "set-active-account",
  UnlockKeyRing = "unlock-keyring",
  TransferCompletedEvent = "transfer-completed-event",
  DeleteAccount = "delete-account",
  ValidateMnemonic = "validate-mnemonic",
}

export class CheckIsLockedMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.CheckIsLocked;
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
    return CheckIsLockedMsg.type();
  }
}

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type(): MessageType {
    return MessageType.LockKeyRing;
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
    return LockKeyRingMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type(): MessageType {
    return MessageType.UnlockKeyRing;
  }

  constructor(public readonly password = "") {
    super();
  }

  validate(): void {
    if (!this.password) {
      throw new Error("Password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UnlockKeyRingMsg.type();
  }
}

export class CheckPasswordMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.CheckPassword;
  }

  constructor(public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.password) {
      throw new Error("Password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckPasswordMsg.type();
  }
}

export class CheckIsPublicKeyRevealedMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.CheckIsPublicKeyRevealed;
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
    return CheckIsPublicKeyRevealedMsg.type();
  }
}

export class ResetPasswordMsg extends Message<
  Result<null, ResetPasswordError>
> {
  public static type(): MessageType {
    return MessageType.ResetPassword;
  }

  constructor(
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly accountId: string
  ) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ResetPasswordMsg.type();
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

export class ValidateMnemonicMsg extends Message<boolean> {
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

export class SaveMnemonicMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.SaveMnemonic;
  }

  constructor(
    public readonly words: string[],
    public readonly password: string,
    public readonly alias: string
  ) {
    super();
  }

  validate(): void {
    if (!this.password) {
      throw new Error("A password is required to save a mnemonic!");
    }

    if (!this.words) {
      throw new Error("A wordlist is required to save a mnemonic!");
    }

    if (
      this.words.length !== PhraseSize.N12 &&
      this.words.length !== PhraseSize.N24
    ) {
      throw new Error("Invalid wordlist length! Not a valid mnemonic.");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SaveMnemonicMsg.type();
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
  validate(): void { }

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
    public readonly payload?: string
  ) {
    super();
  }

  validate(): void {
    if (this.success === undefined) {
      throw new Error("Success is undefined");
    }
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

  constructor(public accountId: string, public password: string) {
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
