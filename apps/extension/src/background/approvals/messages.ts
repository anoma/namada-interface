import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  RejectTx = "reject-tx",
  SubmitApprovedTransfer = "submit-approved-transfer",
  SubmitApprovedIbcTransfer = "submit-approved-ibc-transfer",
  SubmitApprovedBond = "submit-approved-bond",
  SubmitApprovedUnbond = "submit-approved-unbond",
  SubmitApprovedWithdraw = "submit-approved-withdraw",
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

export class SubmitApprovedTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedTransfer;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error(
        "Password is required to submitTx for this type of account!"
      );
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedTransferMsg.type();
  }
}

export class SubmitApprovedIbcTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedIbcTransfer;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error(
        "Password is required to submitTx for this type of account!"
      );
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedIbcTransferMsg.type();
  }
}

export class SubmitApprovedBondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedBond;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submit bond tx!");
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedBondMsg.type();
  }
}

export class SubmitApprovedUnbondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedUnbond;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submit unbond tx!");
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedUnbondMsg.type();
  }
}

export class SubmitApprovedWithdrawMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitApprovedWithdraw;
  }

  constructor(public readonly msgId: string, public readonly password: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId must not be empty!");
    }
    if (!this.password) {
      throw new Error("Password is required to submit unbond tx!");
    }

    return;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitApprovedWithdrawMsg.type();
  }
}

export class ConnectInterfaceResponseMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.ConnectInterfaceResponse;
  }

  constructor(
    public readonly interfaceTabId: number,
    public readonly chainId: string,
    public readonly interfaceOrigin: string,
    public readonly allowConnection: boolean,
  ) {
    super();
  }

  validate(): void {
    if (!this.interfaceTabId) {
      throw new Error("interfaceTabId not set");
    }

    if (!this.chainId) {
      throw new Error("chain ID not set");
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

  constructor(
    public readonly originToRevoke: string
  ) {
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
