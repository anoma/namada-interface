import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  RejectTransfer = "reject-transfer",
  SubmitApprovedTransfer = "submit-approved-transfer",
}

export class RejectTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectTransfer;
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
    return RejectTransferMsg.type();
  }
}

export class SubmitApprovedTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedTransfer;
  }

  constructor(
    public readonly msgId: string,
    public readonly address: string,
    public readonly password: string
  ) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.address) {
      throw new Error("address must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submitTx!");
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
