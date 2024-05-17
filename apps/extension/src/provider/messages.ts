import {
  AccountType,
  Chain,
  DerivedAccount,
  SignArbitraryResponse,
} from "@namada/types";
import { Message } from "router";
import { validateProps } from "utils";

/**
 * Message for use with providers: These messages are called outside of the
 * background context, and need to be available to the providers.
 */

// Route mappings for interacting with services
enum Route {
  KeyRing = "keyring-route",
  Chains = "chains-route",
  Approvals = "approvals-route",
}

enum MessageType {
  IsConnectionApproved = "is-connection-approved",
  ApproveConnectInterface = "approve-connect-interface",
  QueryAccounts = "query-accounts",
  QueryDefaultAccount = "query-default-account",
  ApproveSignTx = "approve-sign-tx",
  EncodeRevealPublicKey = "encode-reveal-public-key",
  GetChain = "get-chain",
  GetChains = "get-chains",
  ApproveEthBridgeTransfer = "approve-eth-bridge-transfer",
  CheckDurability = "check-durability",
  ApproveSignArbitrary = "approve-sign-arbitrary",
  VerifyArbitrary = "verify-arbitrary",
}

/**
 * Messages routed from providers to Chains service
 */
export class IsConnectionApprovedMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.IsConnectionApproved;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return IsConnectionApprovedMsg.type();
  }
}

export class ApproveConnectInterfaceMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ApproveConnectInterface;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveConnectInterfaceMsg.type();
  }
}

export class GetChainMsg extends Message<Chain> {
  public static type(): MessageType {
    return MessageType.GetChain;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return Route.Chains;
  }

  type(): MessageType {
    return GetChainMsg.type();
  }
}

type QueryAccountMsgParams = {
  chainId?: string;
  accountId?: string;
};

/**
 * Messages routed from providers to KeyRing service
 */
export class QueryAccountsMsg extends Message<DerivedAccount[]> {
  public static type(): MessageType {
    return MessageType.QueryAccounts;
  }

  constructor(public readonly query?: QueryAccountMsgParams) {
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

export class QueryDefaultAccountMsg extends Message<
  DerivedAccount | undefined
> {
  public static type(): MessageType {
    return MessageType.QueryDefaultAccount;
  }

  constructor() {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return QueryDefaultAccountMsg.type();
  }
}

export class ApproveSignTxMsg extends Message<Uint8Array[]> {
  public static type(): MessageType {
    return MessageType.ApproveSignTx;
  }

  constructor(
    public readonly accountType: AccountType,
    public readonly signer: string,
    public readonly tx: string[][]
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["accountType", "signer", "tx"]);
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveSignTxMsg.type();
  }
}

export class CheckDurabilityMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.CheckDurability;
  }
  validate(): void {
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return CheckDurabilityMsg.type();
  }
}

export class ApproveSignArbitraryMsg extends Message<SignArbitraryResponse> {
  public static type(): MessageType {
    return MessageType.ApproveSignArbitrary;
  }

  constructor(
    public readonly signer: string,
    public readonly data: string
  ) {
    super();
  }

  validate(): void {
    if (!this.signer) {
      throw new Error("A signer address is required!");
    }
    if (!this.data) {
      throw new Error("Signing data is required!");
    }
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveSignArbitraryMsg.type();
  }
}

export class VerifyArbitraryMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.VerifyArbitrary;
  }

  constructor(
    public readonly publicKey: string,
    public readonly hash: string,
    public readonly signature: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["publicKey", "hash", "signature"]);
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return VerifyArbitraryMsg.type();
  }
}
