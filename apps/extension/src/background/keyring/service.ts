import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PhraseSize } from "@anoma/crypto";
import { KVStore } from "@anoma/storage";
import { DerivedAccount, SignedTx } from "@anoma/types";
import { KeyRing } from "./keyring";
import { Bip44Path } from "types";
import { KeyRingStatus } from "./types";
import { IbcTransfer, Transfer } from "@anoma/shared";

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(protected readonly kvStore: KVStore) {
    this._keyRing = new KeyRing(kvStore);
  }

  lock(): { status: KeyRingStatus } {
    this._keyRing.lock();
    return { status: this._keyRing.status };
  }

  async unlock(password: string): Promise<{ status: KeyRingStatus }> {
    if (!password) {
      throw new Error("A password is required to unlock keystore!");
    }
    await this._keyRing.unlock(password);
    return { status: this._keyRing.status };
  }

  isLocked(): boolean {
    return this._keyRing.isLocked();
  }

  async checkPassword(password: string): Promise<boolean> {
    return await this._keyRing.checkPassword(password);
  }

  async generateMnemonic(size?: PhraseSize): Promise<string[]> {
    return await this._keyRing.generateMnemonic(size);
  }

  async saveMnemonic(
    words: string[],
    password: string,
    description?: string
  ): Promise<boolean> {
    return await this._keyRing.storeMnemonic(words, password, description);
  }

  async deriveAccount(
    path: Bip44Path,
    description?: string
  ): Promise<DerivedAccount> {
    return await this._keyRing.deriveAccount(path, description);
  }

  async queryAccounts(): Promise<DerivedAccount[]> {
    return await this._keyRing.queryAccounts();
  }

  async signTx(
    signer: string,
    txMsg: string,
    txData: string
  ): Promise<SignedTx> {
    return await this._keyRing.signTx(
      signer,
      fromBase64(txMsg),
      fromBase64(txData)
    );
  }

  encodeTransfer(txMsg: string): string {
    try {
      const { tx_data } = new Transfer(fromBase64(txMsg)).to_serialized();
      return toBase64(tx_data);
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to encode transfer! ${e}`);
    }
  }

  encodeIbcTransfer(txMsg: Uint8Array): Uint8Array {
    try {
      const { tx_data } = new IbcTransfer(txMsg).to_serialized();
      return tx_data;
    } catch (e) {
      throw new Error(`Unable to encode IBC transfer! ${e}`);
    }
  }

  /**
   * Creating an InitAccount for Namada requires a secret,
   * therefore, we need to query the private key for this account from
   * storage
   */
  async encodeInitAccount(
    address: string,
    txMsg: Uint8Array
  ): Promise<Uint8Array> {
    return await this._keyRing.encodeInitAccount(address, txMsg);
  }
}
