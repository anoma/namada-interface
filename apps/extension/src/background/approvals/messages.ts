import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  ApproveTx = "approve-tx",
  RejectTx = "reject-tx",
  SubmitApprovedTx = "submit-approved-tx",
}

export class ApproveTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ApproveTx;
  }

  constructor(public readonly txMsg: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg || this.txMsg === "") {
      throw new Error("txMsg was not provided!");
    }
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveTxMsg.type();
  }
}

export class RejectTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectTx;
  }

  constructor(public readonly txId: string) {
    super();
  }

  validate(): void {
    if (!this.txId || this.txId === "") {
      throw new Error("txId was not provided!");
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

export class SubmitApprovedTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedTx;
  }

  constructor(public readonly txId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.txId || this.txId === "") {
      throw new Error("txId was not provided!");
    }
    if (!this.password || this.password === "") {
      throw new Error("Password is required to submitTx!");
    }
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedTxMsg.type();
  }
}
