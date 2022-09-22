import { PhraseSize } from "@anoma/crypto";
import { Message } from "router";
import { ROUTE } from "./constants";
import { KeyRingStatus } from "./types";

enum MessageTypes {
  LockKeyRing = "lock-keyring",
  UnlockKeyRing = "unlock-keyring",
  CheckPassword = "check-password",
  GenerateMnemonic = "generate-mnemonic",
  SaveMnemonic = "save-mnemonic",
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
    public readonly description?: string
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
