import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  RejectTx = "reject-tx",
  SubmitApprovedTx = "submit-approved-tx",
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

  constructor(
    public readonly txId: string,
    public readonly address: string,
    public readonly password: string
  ) {
    super();
  }

  validate(): void {
    if (!this.txId || this.txId === "") {
      throw new Error("txId was not provided!");
    }
    if (!this.address || this.address === "") {
      throw new Error("address was not provided");
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
