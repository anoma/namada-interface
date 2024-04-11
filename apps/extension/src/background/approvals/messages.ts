import { SupportedTx } from "@heliax/namada-sdk/web";
import { Message } from "router";
import { ROUTE } from "./constants";

import { validateProps } from "utils";
import { PendingTxDetails } from "./types";

export enum MessageType {
  RejectTx = "reject-tx",
  SubmitApprovedTx = "submit-approved-tx",
  QueryPendingTx = "query-pending-tx",
  SubmitApprovedSignature = "submit-approved-signature",
  RejectSignature = "reject-signature",
  ConnectInterfaceResponse = "connect-interface-response",
  RevokeConnection = "revoke-connection",
}

export class RejectTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectTx;
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
    return RejectTxMsg.type();
  }
}

export class SubmitApprovedTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedTx;
  }

  constructor(
    public readonly txType: SupportedTx,
    public readonly msgId: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["txType", "msgId"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedTxMsg.type();
  }
}

export class QueryPendingTxMsg extends Message<PendingTxDetails[]> {
  public static type(): MessageType {
    return MessageType.QueryPendingTx;
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
    return RejectTxMsg.type();
  }
}

export class SubmitApprovedSignatureMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedSignature;
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
    return SubmitApprovedSignatureMsg.type();
  }
}

export class RejectSignatureMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.RejectSignature;
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
    return RejectSignatureMsg.type();
  }
}

export class ConnectInterfaceResponseMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ConnectInterfaceResponse;
  }

  constructor(
    public readonly interfaceTabId: number,
    public readonly interfaceOrigin: string,
    public readonly allowConnection: boolean
  ) {
    super();
  }

  validate(): void {
    validateProps(this, [
      "interfaceTabId",
      "interfaceOrigin",
      "allowConnection",
    ]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ConnectInterfaceResponseMsg.type();
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
