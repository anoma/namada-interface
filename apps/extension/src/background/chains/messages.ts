import { Chain, Signer } from "@anoma/types";
import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageTypes {
  SuggestChain = "suggest-chain",
  GetChain = "get-chain",
  GetChains = "get-chains",
  GetSigner = "get-signer",
  RemoveChain = "remove-chain",
  Connect = "connect",
}

export class SuggestChainMsg extends Message<void> {
  public static type(): string {
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
    return ROUTE;
  }

  type(): string {
    return SuggestChainMsg.type();
  }
}

export class GetChainsMsg extends Message<Chain[]> {
  public static type(): string {
    return MessageTypes.GetChains;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainsMsg.type();
  }
}

export class GetChainMsg extends Message<Chain> {
  public static type(): string {
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
    return ROUTE;
  }

  type(): string {
    return GetChainMsg.type();
  }
}

export class RemoveChainMsg extends Message<Chain[]> {
  public static type(): string {
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
    return ROUTE;
  }

  type(): string {
    return RemoveChainMsg.type();
  }
}

export class GetSignerMsg extends Message<Signer> {
  public static type(): string {
    return MessageTypes.GetSigner;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSignerMsg.type();
  }
}
