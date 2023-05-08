import { Chain, DerivedAccount } from "@anoma/types";
import { Message } from "router";

/**
 * Message for use with providers: These messages are called outside of the
 * background context, and need to be available to the providers.
 */

// Route mappings for interacting with services
enum Route {
  KeyRing = "keyring-route",
  Chains = "chains-route",
}

enum MessageType {
  ConnectInterface = "connect-interface",
  QueryAccounts = "query-accounts",
  SignTx = "sign-tx",
  SubmitTransfer = "submit-transfer",
  SubmitIbcTransfer = "submit-ibc-transfer",
  EncodeInitAccount = "encode-init-account",
  EncodeRevealPublicKey = "encode-reveal-public-key",
  GetChain = "get-chain",
  GetChains = "get-chains",
  SuggestChain = "suggest-chain",
  SubmitBond = "submit-bond",
  SubmitUnbond = "submit-unbond",
}

/**
 * Messages routed from providers to Chains service
 */

export class ConnectInterfaceMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ConnectInterface;
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chain ID not set");
    }
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return ConnectInterfaceMsg.type();
  }
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
    return Route.Chains;
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
    return Route.Chains;
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
    return Route.Chains;
  }

  type(): MessageType {
    return GetChainMsg.type();
  }
}

/**
 * Messages routed from providers to KeyRing service
 */
export class QueryAccountsMsg extends Message<DerivedAccount[]> {
  public static type(): MessageType {
    return MessageType.QueryAccounts;
  }

  constructor(public readonly chainId?: string) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return QueryAccountsMsg.type();
  }
}

export class SubmitTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitTransfer;
  }

  constructor(public readonly txMsg: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg) {
      throw new Error("An encoded txMsg is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return SubmitTransferMsg.type();
  }
}

export class SubmitIbcTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitIbcTransfer;
  }

  constructor(public readonly txMsg: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg) {
      throw new Error("An encoded txMsg is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return SubmitIbcTransferMsg.type();
  }
}

export class EncodeInitAccountMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.EncodeInitAccount;
  }

  constructor(public readonly txMsg: string, public readonly address: string) {
    super();
  }

  validate(): void {
    if (!this.address) {
      throw new Error("An address is required!");
    }
    if (!this.txMsg) {
      throw new Error("An encoded txMsg is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return EncodeInitAccountMsg.type();
  }
}

export class EncodeRevealPkMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.EncodeRevealPublicKey;
  }

  constructor(public readonly signer: string) {
    super();
  }

  validate(): void {
    if (!this.signer) {
      throw new Error("An signer is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return EncodeRevealPkMsg.type();
  }
}

export class SubmitBondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitBond;
  }

  constructor(public readonly txMsg: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg) {
      throw new Error("An encoded txMsg is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return SubmitBondMsg.type();
  }
}

export class SubmitUnbondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitUnbond;
  }

  constructor(public readonly txMsg: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg) {
      throw new Error("An encoded txMsg is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return SubmitUnbondMsg.type();
  }
}
