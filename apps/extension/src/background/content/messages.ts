import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  AccountChangedEvent = "account-changed-event",
}

export class AccountChangedEvent extends Message<void> {
  public static type(): MessageType {
    return MessageType.AccountChangedEvent;
  }

  constructor(
    public readonly chainId: string,
    public readonly senderTabId?: number
  ) {
    super();
  }

  validate(): void {
    if (this.chainId === undefined) {
      throw new Error("chainId is undefined");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AccountChangedEvent.type();
  }
}
