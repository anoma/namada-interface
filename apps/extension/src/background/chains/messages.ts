import { Message } from "../../router/Message";
import { ChainInfo as Chain } from "@keplr-wallet/types";

enum MessageTypes {
  SuggestChain = "suggest-chain",
  GetChain = "get-chain",
  GetChains = "get-chains",
  RemoveChain = "remove-chain",
  Connect = "connect",
}

export class SuggestChainMsg extends Message<void> {
  public static type() {
    return MessageTypes.SuggestChain;
  }

  constructor(public readonly chain: Chain) {
    super();
  }

  validate(): void {
    if (!this.chain) {
      throw new Error("chain config not set");
    }
  }

  route(): string {
    return MessageTypes.SuggestChain;
  }

  type(): string {
    return SuggestChainMsg.type();
  }
}

export class GetChainsMsg extends Message<{ chains: Chain[] }> {
  public static type() {
    return MessageTypes.GetChains;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return MessageTypes.GetChains;
  }

  type(): string {
    return GetChainsMsg.type();
  }
}

export class GetChainMsg extends Message<{ chain: Chain }> {
  public static type() {
    return MessageTypes.GetChain;
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
    return MessageTypes.GetChain;
  }

  type(): string {
    return GetChainMsg.type();
  }
}

export class RemoveChainMsg extends Message<{ chains: Chain[] }> {
  public static type() {
    return MessageTypes.RemoveChain;
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
    return MessageTypes.RemoveChain;
  }

  type(): string {
    return RemoveChainMsg.type();
  }
}
