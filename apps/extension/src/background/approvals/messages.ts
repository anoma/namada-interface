import { Message } from "router";
import { ROUTE } from "./constants";
import { SupportedTx } from "@namada/shared";

import { validateProps } from "utils";

enum MessageType {
  RejectTx = "reject-tx",
  SubmitApprovedTx = "submit-approved-tx",
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
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    return;
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
    public readonly msgId: string,
    public readonly password: string
  ) {
    super();
  }

  validate(): void {
    validateProps(this, ["txType", "msgId", "password"]);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedTxMsg.type();
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
    if (!this.interfaceTabId) {
      throw new Error("interfaceTabId not set");
    }

    if (!this.interfaceOrigin) {
      throw new Error("interfaceOrigin not set");
    }
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
    if (!this.originToRevoke) {
      throw new Error("originToRevoke not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RevokeConnectionMsg.type();
  }
}
