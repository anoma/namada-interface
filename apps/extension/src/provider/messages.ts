import { Chain, DerivedAccount, SignedTx } from "@anoma/types";
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
  QueryAccounts = "query-accounts",
  SignTx = "sign-tx",
  EncodeTransfer = "encode-transfer",
  EncodeIbcTransfer = "encode-ibc-transfer",
  EncodeInitAccount = "encode-init-account",
  EncodeRevealPublicKey = "encode-reveal-public-key",
  GetChain = "get-chain",
  GetChains = "get-chains",
  SuggestChain = "suggest-chain",
  EncodeBonding = "encode-bonding",
  SubmitBond = "submit-bond",
}

/**
 * Messages routed from providers to Chains service
 */
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

export class SignTxMsg extends Message<SignedTx> {
  public static type(): MessageType {
    return MessageType.SignTx;
  }

  constructor(
    public readonly signer: string,
    public readonly txMsg: string,
    public readonly txData: string
  ) {
    super();
  }

  validate(): void {
    if (!this.signer) {
      throw new Error("A signer address is required to sign transactions!");
    }
    if (!this.txMsg || this.txMsg.length === 0) {
      throw new Error("An encoded txMsg is required!");
    }
    if (!this.txData) {
      throw new Error("txData bytes is required!");
    }
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return SignTxMsg.type();
  }
}

export class EncodeTransferMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.EncodeTransfer;
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
    return EncodeTransferMsg.type();
  }
}

export class EncodeIbcTransferMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.EncodeIbcTransfer;
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
    return EncodeIbcTransferMsg.type();
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

export class EncodeBondingMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.EncodeBonding;
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
    return EncodeBondingMsg.type();
  }
}

export class SubmitBondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitBond;
  }

  constructor(public readonly txMsg1: string, public readonly txMsg2: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg1) {
      throw new Error("An encoded txMsg is required!");
    }
    if (!this.txMsg2) {
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
