import { ResponseSign } from "@namada/ledger-namada";
import { Bip44Path } from "@namada/types";

import { Message } from "router";
import { ROUTE } from "./constants";
import { TxType } from "@namada/shared";

enum MessageType {
  AddLedgerAccount = "add-ledger-account",
  GetTxBytes = "get-tx-bytes",
  GetRevealPKBytes = "get-reveal-pk-bytes",

  // TODO: - Implement for single SubmitSignedTx
  SubmitSignedTx = "submit-signed-tx",

  // TODO: Remove:
  SubmitSignedRevealPK = "submit-signed-reveal-pk",
  SubmitSignedTransfer = "submit-signed-transfer",
  SubmitSignedBond = "submit-signed-bond",
  SubmitSignedUnbond = "submit-signed-unbond",
}

export class AddLedgerAccountMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.AddLedgerAccount;
  }

  constructor(
    public readonly alias: string,
    public readonly address: string,
    public readonly publicKey: string,
    public readonly bip44Path: Bip44Path
  ) {
    super();
  }

  validate(): void {
    if (!this.alias) {
      throw new Error("Alias must not be empty!");
    }

    if (!this.address) {
      throw new Error("Address was not provided!");
    }

    if (!this.publicKey) {
      throw new Error("Public key was not provided!");
    }

    if (!this.bip44Path) {
      throw new Error("BIP44 Path was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddLedgerAccountMsg.type();
  }
}

export class GetTxBytesMsg extends Message<{
  bytes: Uint8Array;
  path: string;
}> {
  public static type(): MessageType {
    return MessageType.GetTxBytes;
  }

  constructor(
    public readonly txType: TxType,
    public readonly txMsg: string,
    public readonly address: string
  ) {
    super();
  }

  validate(): void {
    if (!this.txType) {
      throw new Error("txType is required!");
    }
    if (!this.txMsg) {
      throw new Error("txMsg was not provided!");
    }
    if (!this.address) {
      throw new Error("address was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetTxBytesMsg.type();
  }
}

export class GetRevealPKBytesMsg extends Message<{
  bytes: Uint8Array;
  path: string;
}> {
  public static type(): MessageType {
    return MessageType.GetRevealPKBytes;
  }

  constructor(public readonly txMsg: string) {
    super();
  }

  validate(): void {
    if (!this.txMsg) {
      throw new Error("txMsg was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetRevealPKBytesMsg.type();
  }
}

export class SubmitSignedRevealPKMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitSignedRevealPK;
  }

  constructor(
    public readonly txMsg: string,
    public readonly bytes: string,
    public readonly signatures: ResponseSign
  ) {
    super();
  }

  validate(): void {
    if (!this.txMsg) {
      throw new Error("txMsg was not provided!");
    }

    if (!this.bytes) {
      throw new Error("bytes were not provided!");
    }

    if (!this.signatures) {
      throw new Error("No signatures were provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitSignedRevealPKMsg.type();
  }
}

export class SubmitSignedTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitSignedTransfer;
  }

  constructor(
    public readonly msgId: string,
    public readonly bytes: string,
    public readonly signatures: ResponseSign
  ) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId was not provided!");
    }

    if (!this.bytes) {
      throw new Error("bytes were not provided!");
    }

    if (!this.signatures) {
      throw new Error("No signatures were provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitSignedTransferMsg.type();
  }
}

export class SubmitSignedBondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitSignedBond;
  }

  constructor(
    public readonly msgId: string,
    public readonly bytes: string,
    public readonly signatures: ResponseSign
  ) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId was not provided!");
    }

    if (!this.bytes) {
      throw new Error("bytes were not provided!");
    }

    if (!this.signatures) {
      throw new Error("No signatures were provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitSignedBondMsg.type();
  }
}

export class SubmitSignedUnbondMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitSignedUnbond;
  }

  constructor(
    public readonly msgId: string,
    public readonly bytes: string,
    public readonly signatures: ResponseSign
  ) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId was not provided!");
    }

    if (!this.bytes) {
      throw new Error("bytes were not provided!");
    }

    if (!this.signatures) {
      throw new Error("No signatures were provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitSignedUnbondMsg.type();
  }
}
