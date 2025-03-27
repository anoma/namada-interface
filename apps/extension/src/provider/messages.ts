import {
  DerivedAccount,
  GenDisposableSignerResponse,
  SignArbitraryResponse,
} from "@namada/types";
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
  ApproveDisconnectInterface = "approve-disconnect-interface",
  QueryAccounts = "query-accounts",
  QueryDefaultAccount = "query-default-account",
  ApproveUpdateDefaultAccount = "approve-update-default-account",
  EncodeRevealPublicKey = "encode-reveal-public-key",
  SpendingKey = "spending-key",
  ApproveEthBridgeTransfer = "approve-eth-bridge-transfer",
  CheckDurability = "check-durability",
  VerifyArbitrary = "verify-arbitrary",
  GenDisposableSigner = "gen-disposable-signer",
  PersistDisposableSigner = "persist-disposable-signer",
  ClearDisposableSigner = "clear-disposable-signer",
}

export class ApproveSignTxMsg extends Message<Uint8Array[]> {
  public static type(): MessageType {
    return MessageType.ApproveSignTx;
  }

  constructor(
    public readonly tx: EncodedTxData[],
    public readonly signer: string,
    public readonly checksums?: Record<string, string>
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["signer", "tx"]);
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
    validateProps(this, ["signer", "data"]);
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

  constructor(public readonly chainId?: string) {
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

  constructor(public readonly chainId?: string) {
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

export class ApproveDisconnectInterfaceMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ApproveDisconnectInterface;
  }

  constructor(
    public readonly originToRevoke: string,
    public readonly chainId?: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["originToRevoke"]);
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveDisconnectInterfaceMsg.type();
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

export class ApproveUpdateDefaultAccountMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ApproveUpdateDefaultAccount;
  }

  constructor(public readonly address: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["address"]);
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveUpdateDefaultAccountMsg.type();
  }
}

export class SpendingKeyMsg extends Message<
  [Array<number>, Array<number>, Array<number>, Array<number>] | undefined
> {
  public static type(): MessageType {
    return MessageType.SpendingKey;
  }

  constructor(public readonly publicKey: number[]) {
    super();
  }

  validate(): void {
    validateProps(this, ["publicKey"]);
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return SpendingKeyMsg.type();
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

export class GenDisposableSignerMsg extends Message<
  GenDisposableSignerResponse | undefined
> {
  public static type(): MessageType {
    return MessageType.GenDisposableSigner;
  }

  constructor() {
    super();
  }

  validate(): void {}

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return GenDisposableSignerMsg.type();
  }
}

export class PersistDisposableSignerMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.PersistDisposableSigner;
  }

  constructor(public readonly address: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["address"]);
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return PersistDisposableSignerMsg.type();
  }
}

export class ClearDisposableSignerMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ClearDisposableSigner;
  }

  constructor(public readonly address: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["address"]);
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return ClearDisposableSignerMsg.type();
  }
}
