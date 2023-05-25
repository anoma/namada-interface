import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  SubmitApproveTx = "submit-approve-tx",
}

export class SubmitApproveTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApproveTx;
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
    return SubmitApproveTxMsg.type();
  }
}
