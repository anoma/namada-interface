import { ResponseSign } from "@zondax/ledger-namada";

import { Bip44Path } from "@anoma/types";

import { Message } from "router";
import { ROUTE } from "./constants";

enum MessageType {
  AddLedgerAccount = "add-ledger-account",
  GetTransferBytes = "get-transfer-bytes",
  SubmitSignedTransfer = "submit-signed-transfer",
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
      throw new Error("msgId was not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetTransferBytesMsg.type();
  }
}

export class SubmitSignedTransferMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitSignedTransfer;
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
    return SubmitSignedTransferMsg.type();
  }
}
