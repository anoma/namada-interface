import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  TransferCompletedEvent = "transfer-completed-event",
}

export class TransferCompletedEvent extends Message<void> {
  public static type(): MessageType {
    return MessageType.TransferCompletedEvent;
  }

  constructor(
    public readonly success: boolean,
    public readonly msgId: string,
    public readonly senderTabId: number
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
