import { Result } from "@namada/utils";
import { Message } from "router";
import { ROUTE } from "./constants";
import { ResetPasswordError } from "./types";

enum MessageType {
  CheckIsLocked = "check-is-locked",
  CheckPassword = "check-password",
  LockKeyRing = "lock-keyring",
  ResetPassword = "reset-password",
  UnlockKeyRing = "unlock-keyring",
  PasswordInitialized = "password-initialized",
  CreatePassword = "create-password",
  Logout = "logout",
}
export class CheckPasswordInitializedMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.PasswordInitialized;
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
    return CheckPasswordInitializedMsg.type();
  }
}

export class LogoutMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.Logout;
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
    return LogoutMsg.type();
  }
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

export class LockVaultMsg extends Message<void> {
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
    return LockVaultMsg.type();
  }
}

export class UnlockVaultMsg extends Message<boolean> {
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
    return UnlockVaultMsg.type();
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

export class ResetPasswordMsg extends Message<
  Result<null, ResetPasswordError>
> {
  public static type(): MessageType {
    return MessageType.ResetPassword;
  }

  constructor(
    public readonly currentPassword: string,
    public readonly newPassword: string
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

export class CreatePasswordMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.CreatePassword;
  }

  constructor(public readonly password: string) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreatePasswordMsg.type();
  }
}
