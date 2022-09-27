import { PhraseSize } from "@anoma/crypto";
import { Message } from "router";
import { ROUTE } from "./constants";
import { Bip44Path, DerivedAccount, KeyRingStatus } from "./types";

enum MessageTypes {
  LockKeyRing = "lock-keyring",
  UnlockKeyRing = "unlock-keyring",
  CheckPassword = "check-password",
  GenerateMnemonic = "generate-mnemonic",
  SaveMnemonic = "save-mnemonic",
  DeriveAccount = "derive-account",
  QueryAccounts = "query-accounts",
}

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return MessageTypes.LockKeyRing;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LockKeyRingMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return MessageTypes.UnlockKeyRing;
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
  public static type() {
    return MessageTypes.CheckPassword;
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

export class GenerateMnemonicMsg extends Message<string[]> {
  public static type() {
    return MessageTypes.GenerateMnemonic;
  }

  constructor(public readonly size?: PhraseSize) {
    super();
  }

  validate(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GenerateMnemonicMsg.type();
  }
}

export class SaveMnemonicMsg extends Message<boolean> {
  public static type() {
    return MessageTypes.SaveMnemonic;
  }

  constructor(
    public readonly words: string[],
    public readonly password: string,
    public readonly alias?: string
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
      this.words.length !== PhraseSize.Twelve &&
      this.words.length !== PhraseSize.TwentyFour
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

export class DeriveAccountMsg extends Message<DerivedAccount> {
  public static type() {
    return MessageTypes.DeriveAccount;
  }

  constructor(public readonly path: Bip44Path, public readonly alias?: string) {
    super();
  }

  validate(): void {
    if (!this.path) {
      throw new Error("A Bip44Path object must be provided!");
    }

    const { account, change, index } = this.path;

    if (!account) {
      throw new Error("A Bip44Path account path was not provided!");
    }

    if (!change) {
      throw new Error("A Bip44Path change path was not provided!");
    }

    if (!index) {
      throw new Error("A Bip44Path index path was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeriveAccountMsg.type();
  }
}

export class QueryAccountsMsg extends Message<DerivedAccount[]> {
  public static type() {
    return MessageTypes.QueryAccounts;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryAccountsMsg.type();
  }
}
