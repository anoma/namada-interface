import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  UpdateChain = "update-chain",
}

export class UpdateChainMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.UpdateChain;
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("Chain ID not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateChainMsg.type();
  }
}
