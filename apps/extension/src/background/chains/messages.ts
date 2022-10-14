import { Chain } from "@anoma/types";
import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  RemoveChain = "remove-chain",
  Connect = "connect",
}

export class RemoveChainMsg extends Message<Chain[]> {
  public static type(): MessageType {
    return MessageType.RemoveChain;
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
    return RemoveChainMsg.type();
  }
}
