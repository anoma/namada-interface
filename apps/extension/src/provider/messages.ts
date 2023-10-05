import {
  AccountType,
  Chain,
  DerivedAccount,
  SupportedTx
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
  ApproveConnectInterface = "approve-connect-interface",
  QueryAccounts = "query-accounts",
  ApproveTx = "approve-tx",
  QueryBalances = "query-balances",
  SubmitIbcTransfer = "submit-ibc-transfer",
  SubmitLedgerTransfer = "submit-ledger-transfer",
  EncodeRevealPublicKey = "encode-reveal-public-key",
  GetChain = "get-chain",
  GetChains = "get-chains",
  SuggestChain = "suggest-chain",
  FetchAndStoreMaspParams = "fetch-and-store-masp-params",
  HasMaspParams = "has-masp-params",
  ApproveEthBridgeTransfer = "approve-eth-bridge-transfer",
  CheckDurability = "check-durability",
}

/**
 * Messages routed from providers to Chains service
 */

export class ApproveConnectInterfaceMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ApproveConnectInterface;
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
    return Route.Approvals;
  }

  type(): string {
    return ApproveConnectInterfaceMsg.type();
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

export class QueryBalancesMsg extends Message<
  {
    token: string;
    amount: string;
  }[]
> {
  public static type(): MessageType {
    return MessageType.QueryBalances;
  }

  constructor(public readonly owner: string) {
    super();
  }

  validate(): void {
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return QueryBalancesMsg.type();
  }
}

export class ApproveTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ApproveTx;
  }

  constructor(
    public readonly txType: SupportedTx,
    public readonly txMsg: string,
    public readonly specificMsg: string,
    public readonly accountType: AccountType
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["txType", "txMsg", "specificMsg", "accountType"]);
  }

  route(): string {
    return Route.Approvals;
  }

  type(): string {
    return ApproveTxMsg.type();
  }
}

export class FetchAndStoreMaspParamsMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.FetchAndStoreMaspParams;
  }
  validate(): void {
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return FetchAndStoreMaspParamsMsg.type();
  }
}

export class HasMaspParamsMsg extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.HasMaspParams;
  }
  validate(): void {
    return;
  }

  route(): string {
    return Route.KeyRing;
  }

  type(): string {
    return HasMaspParamsMsg.type();
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
