import { Message } from "router";
import { ROUTE } from "./constants";

import { validateProps } from "utils";

export enum MessageType {
  RejectSignTx = "reject-sign-tx",
  SubmitApprovedSignTx = "submit-approved-sign-tx",
  SubmitApprovedSignBatchTx = "submit-approved-sign-batch-tx",
  SubmitApprovedSignArbitrary = "submit-approved-sign-arbitrary",
  RejectSignArbitrary = "reject-sign-arbitrary",
  ConnectInterfaceResponse = "connect-interface-response",
  RevokeConnection = "revoke-connection",
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

export class SubmitApprovedSignBatchTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedSignBatchTx;
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
    return SubmitApprovedSignBatchTxMsg.type();
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
