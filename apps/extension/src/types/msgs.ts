import { ChainConfig } from "@anoma/types";
import { Message } from "../router/Message";

export enum MessageTypes {
  AddChain = "add-chain",
  Enable = "enable",
  GetSigner = "get-signer",
}

export class AddChainMsg extends Message<void> {
  public static type() {
    return MessageTypes.AddChain;
  }

  constructor(public readonly config: ChainConfig) {
    super();
  }

  validate(): void {
    if (!this.config) {
      throw new Error("chain config not set");
    }
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return AddChainMsg.type();
  }
}
