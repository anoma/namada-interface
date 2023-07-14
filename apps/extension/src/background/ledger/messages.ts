import { ResponseSign } from "@anoma/ledger-namada";

import { Bip44Path } from "@anoma/types";

import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  AddLedgerAccount = "add-ledger-account",

  // Reveal PK
  GetRevealPKBytes = "get-reveal-pk-bytes",
  SubmitSignedRevealPK = "submit-signed-reveal-pk",

  // Transfers
  GetTransferBytes = "get-transfer-bytes",
  SubmitSignedTransfer = "submit-signed-transfer",

  // Bonds
  GetBondBytes = "get-bond-bytes",
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

export class GetTransferBytesMsg extends Message<{
  bytes: Uint8Array;
  path: string;
}> {
  public static type(): MessageType {
    return MessageType.GetTransferBytes;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("Transfer Tx msgId was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetTransferBytesMsg.type();
  }
}

export class GetBondBytesMsg extends Message<{
  bytes: Uint8Array;
  path: string;
}> {
  public static type(): MessageType {
    return MessageType.GetBondBytes;
  }

  constructor(public readonly msgId: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("Bond Tx msgId was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetBondBytesMsg.type();
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
    public readonly signatures: ResponseSign,
    public readonly publicKey: string
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

    if (!this.publicKey) {
      throw new Error("No publicKey provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SubmitSignedUnbondMsg.type();
  }
}
