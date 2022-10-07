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
    txMsg: Uint8Array,
    txData: Uint8Array
  ): Promise<SignedTx> {
    return await this._keyRing.signTx(signer, txMsg, txData);
  }

  encodeTransfer(txMsg: Uint8Array): Uint8Array {
    const { tx_data } = new Transfer(txMsg).to_serialized();
    return tx_data;
  }

  encodeIbcTransfer(txMsg: Uint8Array): Uint8Array {
    const { tx_data } = new IbcTransfer(txMsg).to_serialized();
    return tx_data;
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
