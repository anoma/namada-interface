import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  TransferCompletedMsg = "transfer-completed-msg",
}

export class TransferCompletedMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.TransferCompletedMsg;
  }

  constructor(public readonly success: boolean) {
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
    return TransferCompletedMsg.type();
  }
}
