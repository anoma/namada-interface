import { Message } from "router";
import { ROUTE } from "./constants";

import { TxDetails } from "@namada/types";
import { ResponseSign } from "@zondax/ledger-namada";
import { validateProps } from "utils";

export enum MessageType {
  RejectSignTx = "reject-sign-tx",
  SubmitApprovedSignTx = "submit-approved-sign-tx",
  SubmitApprovedSignArbitrary = "submit-approved-sign-arbitrary",
  SubmitApprovedSignLedgerTx = "submit-approved-sign-ledger-tx",
  RejectSignArbitrary = "reject-sign-arbitrary",
  ConnectInterfaceResponse = "connect-interface-response",
  DisconnectInterfaceResponse = "disconnect-interface-response",
  RevokeConnection = "revoke-connection",
  SubmitUpdateDefaultAccount = "submit-update-default-account",
  QueryTxDetails = "query-tx-details",
  QuerySignArbitraryData = "query-sign-arbitrary-data",
  QueryPendingTxBytes = "query-pending-tx-bytes",
}

export class SubmitApprovedSignTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedSignTx;
  }

  constructor(
    public readonly msgId: string,
    public readonly signer: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId", "signer"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedSignTxMsg.type();
  }
}

export class SubmitApprovedSignLedgerTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedSignLedgerTx;
  }

  constructor(
    public readonly msgId: string,
    public readonly responseSign: ResponseSign[]
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId", "responseSign"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedSignLedgerTxMsg.type();
  }
}

export class RejectSignTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectSignTx;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSignTxMsg.type();
  }
}

export class SubmitApprovedSignArbitraryMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedSignArbitrary;
  }

  constructor(
    public readonly msgId: string,
    public readonly signer: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId", "signer"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedSignArbitraryMsg.type();
  }
}

export class RejectSignArbitraryMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectSignArbitrary;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId"]);
    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectSignArbitraryMsg.type();
  }
}

export class ConnectInterfaceResponseMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ConnectInterfaceResponse;
  }

  constructor(
    public readonly interfaceOrigin: string,
    public readonly allowConnection: boolean,
    public readonly chainId?: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["interfaceOrigin", "allowConnection"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ConnectInterfaceResponseMsg.type();
  }
}

export class DisconnectInterfaceResponseMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.DisconnectInterfaceResponse;
  }

  constructor(
    public readonly interfaceOrigin: string,
    public readonly revokeConnection: boolean
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["interfaceOrigin", "revokeConnection"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DisconnectInterfaceResponseMsg.type();
  }
}

export class RevokeConnectionMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RevokeConnection;
  }

  constructor(public readonly originToRevoke: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["originToRevoke"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RevokeConnectionMsg.type();
  }
}

export class SubmitUpdateDefaultAccountMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitUpdateDefaultAccount;
  }

  constructor(public readonly address: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["address"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitUpdateDefaultAccountMsg.type();
  }
}

export class QueryTxDetailsMsg extends Message<TxDetails[]> {
  public static type(): MessageType {
    return MessageType.QueryTxDetails;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryTxDetailsMsg.type();
  }
}

export class QueryPendingTxBytesMsg extends Message<string[] | undefined> {
  public static type(): MessageType {
    return MessageType.QueryPendingTxBytes;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryPendingTxBytesMsg.type();
  }
}

export class QuerySignArbitraryDataMsg extends Message<string> {
  public static type(): MessageType {
    return MessageType.QuerySignArbitraryData;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    validateProps(this, ["msgId"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QuerySignArbitraryDataMsg.type();
  }
}
