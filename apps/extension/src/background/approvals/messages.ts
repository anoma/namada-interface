import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  RejectTx = "reject-tx",
  SubmitApprovedTransfer = "submit-approved-transfer",
  SubmitApprovedBond = "submit-approved-bond",
  SubmitApprovedUnbond = "submit-approved-unbond",
  SubmitApprovedWithdraw = "submit-approved-withdraw",
}

export class RejectTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectTx;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectTxMsg.type();
  }
}

export class SubmitApprovedTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedTransfer;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error(
        "Password is required to submitTx for this type of account!"
      );
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedTransferMsg.type();
  }
}

export class SubmitApprovedBondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedBond;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submit bond tx!");
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedBondMsg.type();
  }
}

export class SubmitApprovedUnbondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedUnbond;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submit unbond tx!");
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedUnbondMsg.type();
  }
}

export class SubmitApprovedWithdrawMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedWithdraw;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submit unbond tx!");
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedWithdrawMsg.type();
  }
}
