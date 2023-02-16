import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PhraseSize } from "@anoma/crypto";
import { KVStore } from "@anoma/storage";
import { AccountType, Bip44Path, DerivedAccount, SignedTx } from "@anoma/types";
import { KeyRing } from "./keyring";
import { KeyRingStatus, KeyStore } from "./types";
import { IbcTransfer, Sdk } from "@anoma/shared";

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(
    protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly sdkStore: KVStore<string>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk
  ) {
    this._keyRing = new KeyRing(kvStore, sdkStore, chainId, sdk);
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
    alias?: string
  ): Promise<boolean> {
    return await this._keyRing.storeMnemonic(words, password, alias);
  }

  async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias?: string
  ): Promise<DerivedAccount> {
    return await this._keyRing.deriveAccount(path, type, alias);
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

  async submitBond(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitBond(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to submit bond tx! ${e}`);
    }
  }

  async submitUnbond(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitUnbond(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to submit unbond tx! ${e}`);
    }
  }

  async submitTransfer(txMsg: string): Promise<void> {
    try {
      await this._keyRing.submitTransfer(fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to encode transfer! ${e}`);
    }
  }

  encodeIbcTransfer(txMsg: string): string {
    try {
      const { tx_data } = new IbcTransfer(fromBase64(txMsg)).to_serialized();
      return toBase64(tx_data);
    } catch (e) {
      throw new Error(`Unable to encode IBC transfer! ${e}`);
    }
  }

  /**
   * Creating an InitAccount for Namada requires a secret,
   * therefore, we need to query the private key for this account from
   * storage
   */
  async encodeInitAccount(txMsg: string, address: string): Promise<string> {
    const tx_data = await this._keyRing.encodeInitAccount(
      address,
      fromBase64(txMsg)
    );
    return toBase64(tx_data);
  }

  async encodeRevealPk(signer: string): Promise<string> {
    const tx_data = await this._keyRing.encodeRevealPk(signer);
    return toBase64(tx_data);
  }
}
