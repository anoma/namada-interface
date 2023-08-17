import { ResponseSign } from "@namada/ledger-namada";
import { Bip44Path, DerivedAccount } from "@namada/types";

import { Message } from "router";
import { ROUTE } from "./constants";
import { TxType } from "@namada/shared";
import { Result } from "@namada/utils";
import { DeleteAccountError } from "background/keyring";

enum MessageType {
  AddLedgerParentAccount = "add-ledger-parent-account",
  AddLedgerAccount = "add-ledger-account",
  DeleteLedgerAccount = "delete-ledger-account",
  GetTxBytes = "get-tx-bytes",
  GetRevealPKBytes = "get-reveal-pk-bytes",
  SubmitSignedTx = "submit-signed-tx",
  SubmitSignedRevealPK = "submit-signed-reveal-pk",
  QueryStoredPK = "query-stored-pk",
  StoreRevealedPK = "store-revealed-pk",
}

export class AddLedgerParentAccountMsg extends Message<DerivedAccount> {
  public static type(): MessageType {
    return MessageType.AddLedgerParentAccount;
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
    return AddLedgerParentAccountMsg.type();
  }
}

export class AddLedgerAccountMsg extends Message<DerivedAccount> {
  public static type(): MessageType {
    return MessageType.AddLedgerAccount;
  }

  constructor(
    public readonly alias: string,
    public readonly address: string,
    public readonly parentId: string,
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

    if (!this.parentId) {
      throw new Error("Parent ID was not provided!");
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

export class SubmitSignedTxMsg extends Message<void> {
  public static type(): MessageType {
    return MessageType.SubmitSignedTx;
  }

  constructor(
    public readonly txType: TxType,
    public readonly msgId: string,
    public readonly bytes: string,
    public readonly signatures: ResponseSign
  ) {
    super();
  }

  validate(): void {
    if (!this.txType) {
      throw new Error("txType was not provided!");
    }

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
    return SubmitSignedTxMsg.type();
  }
}

export class DeleteLedgerAccountMsg extends Message<
  Result<null, DeleteAccountError>
> {
  public static type(): MessageType {
    return MessageType.DeleteLedgerAccount;
  }

  constructor(public accountId: string) {
    super();
  }

  validate(): void {
    if (!this.accountId) {
      throw new Error("accountId not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeleteLedgerAccountMsg.type();
  }
}

export class QueryStoredPK extends Message<boolean> {
  public static type(): MessageType {
    return MessageType.QueryStoredPK;
  }

  constructor(public publicKey: string) {
    super();
  }

  validate(): void {
    if (!this.publicKey) {
      throw new Error("publicKey not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return QueryStoredPK.type();
  }
}

export class StoreRevealedPK extends Message<void> {
  public static type(): MessageType {
    return MessageType.StoreRevealedPK;
  }

  constructor(public publicKey: string) {
    super();
  }

  validate(): void {
    if (!this.publicKey) {
      throw new Error("publicKey not provided!");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return StoreRevealedPK.type();
  }
}
