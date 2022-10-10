import { Chain, Signer } from "@anoma/types";
import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  SuggestChain = "suggest-chain",
  GetChain = "get-chain",
  GetChains = "get-chains",
  GetSigner = "get-signer",
  RemoveChain = "remove-chain",
  Connect = "connect",
}

export class SuggestChainMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SuggestChain;
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

  type(): MessageType {
    return SuggestChainMsg.type();
  }
}

export class GetChainsMsg extends Message<Chain[]> {
  public static type(): MessageType {
    return MessageType.GetChains;
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
  public static type(): MessageType {
    return MessageType.GetChain;
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

  type(): MessageType {
    return GetChainMsg.type();
  }
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

export class GetSignerMsg extends Message<Signer> {
  public static type(): MessageType {
    return MessageType.GetSigner;
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
