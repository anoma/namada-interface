import { TxType } from "@heliax/namada-sdk/web";
import { Chain, DerivedAccount, SignArbitraryResponse } from "@namada/types";
import { EncodedTxData } from "background/approvals";
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
  ApproveSignTx = "approve-sign-tx",
  ApproveSignArbitrary = "approve-sign-arbitrary",
  IsConnectionApproved = "is-connection-approved",
  ApproveConnectInterface = "approve-connect-interface",
  QueryAccounts = "query-accounts",
  QueryDefaultAccount = "query-default-account",
  EncodeRevealPublicKey = "encode-reveal-public-key",
  GetChain = "get-chain",
  GetChains = "get-chains",
  ApproveEthBridgeTransfer = "approve-eth-bridge-transfer",
  CheckDurability = "check-durability",
  VerifyArbitrary = "verify-arbitrary",
}

export class ApproveSignTxMsg extends Message<Uint8Array> {
  public static type(): MessageType {
    return MessageType.ApproveSignTx;
  }

  constructor(
    // TODO: Simplify these args!
    public readonly txType: TxType,
    public readonly tx: EncodedTxData,
    public readonly signer: string,
    public readonly wrapperTxMsg: string,
    public readonly checksums?: Record<string, string>
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["txType", "signer", "tx", "wrapperTxMsg"]);
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveSignTxMsg.type();
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
