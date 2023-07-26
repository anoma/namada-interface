import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";

import { AccountType, Bip44Path } from "@namada/types";
import { ResponseSign } from "@namada/ledger-namada";
import { Sdk, TxType } from "@namada/shared";
import { IStore, KVStore, Store } from "@namada/storage";
import { chains } from "@namada/chains";
import { makeBip44Path } from "@namada/utils";

import {
  AccountStore,
  KeyRingService,
  TabStore,
  syncTabs,
} from "background/keyring";
import { encodeSignature, generateId, getEncodedTxByType } from "utils";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { UpdatedStakingEventMsg } from "content/events";
import { TxMsgValue } from "@namada/types/src/tx/schema/tx";

export const LEDGERSTORE_KEY = "ledger-store";
const UUID_NAMESPACE = "be9fdaee-ffa2-11ed-8ef1-325096b39f47";

export class LedgerService {
  private _ledgerStore: IStore<AccountStore>;

  constructor(
    protected readonly keyring: KeyRingService,
    protected readonly kvStore: KVStore<AccountStore[]>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly txStore: KVStore<string>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly requester: ExtensionRequester
  ) {
    this._ledgerStore = new Store(LEDGERSTORE_KEY, kvStore);
  }

  async getRevealPKBytes(
    txMsg: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const { coinType } = chains[this.chainId].bip44;

    try {
      // Deserialize txMsg to retrieve source
      const { publicKey } = deserialize(
        Buffer.from(fromBase64(txMsg)),
        TxMsgValue
      );

      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("publicKey", publicKey);

      if (!account) {
        throw new Error(`Ledger account not found for ${publicKey}`);
      }

      const bytes = await this.sdk.build_tx(TxType.RevealPK, fromBase64(txMsg));
      const path = makeBip44Path(coinType, account.path);

      return { bytes, path };
    } catch (e) {
      console.warn(e);
      throw new Error(`${e}`);
    }
  }

  async submitRevealPk(
    txMsg: string,
    bytes: string,
    signatures: ResponseSign
  ): Promise<void> {
    const { wrapperSignature, rawSignature } = signatures;

    try {
      // Serialize signatures
      const rawSig = encodeSignature(rawSignature);
      const wrapperSig = encodeSignature(wrapperSignature);

      await this.sdk.submit_signed_reveal_pk(
        fromBase64(txMsg),
        fromBase64(bytes),
        rawSig,
        wrapperSig
      );
    } catch (e) {
      console.warn(e);
    }
  }

  async submitTx(
    txType: TxType,
    msgId: string,
    bytes: string,
    signatures: ResponseSign
  ): Promise<void> {
    const txMsg = await this.txStore.get(msgId);

    if (!txMsg) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    const encodedTx = getEncodedTxByType(txType, txMsg);
    const { wrapperSignature, rawSignature } = signatures;

    // Serialize signatures
    const rawSig = encodeSignature(rawSignature);
    const wrapperSig = encodeSignature(wrapperSignature);

    try {
      await this.sdk.submit_signed_tx(
        encodedTx,
        fromBase64(bytes),
        rawSig,
        wrapperSig
      );

      // Clear pending tx if successful
      await this.txStore.set(msgId, null);
    } catch (e) {
      console.warn(e);
    }
  }

  async getTxBytes(
    txType: TxType,
    msgId: string,
    address: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const txMsg = await this.txStore.get(msgId);

    if (!txMsg) {
      console.warn(`txMsg not found for msgId: ${msgId}`);
      throw new Error(`Transfer Transaction ${msgId} not found!`);
    }

    const { coinType } = chains[this.chainId].bip44;

    try {
      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("address", address);

      if (!account) {
        throw new Error(`Ledger account not found for ${address}`);
      }

      const bytes = await this.sdk.build_tx(txType, fromBase64(txMsg));
      const path = makeBip44Path(coinType, account.path);

      return { bytes, path };
    } catch (e) {
      console.warn(e);
      throw new Error(`${e}`);
    }
  }
  /**
   * Append a new address record for use with Ledger
   */
  async addAccount(
    alias: string,
    address: string,
    publicKey: string,
    bip44Path: Bip44Path
  ): Promise<void> {
    // Check if account exists in storage, return if so:
    const record = await this._ledgerStore.getRecord("address", address);
    if (record) {
      return;
    }

    // Generate a UUID v5 unique id from alias & path
    const id = generateId(UUID_NAMESPACE, alias, address);

    const account = {
      id,
      alias,
      address,
      publicKey,
      owner: address,
      chainId: this.chainId,
      path: bip44Path,
      type: AccountType.Ledger,
    };
    await this._ledgerStore.append(account);

    // Prepare SDK store
    this.sdk.clear_storage();
    await this.keyring.initSdkStore(id);

    // Set active account ID
    await this.keyring.setActiveAccount(id, AccountType.Ledger);
  }

  async broadcastUpdateStaking(): Promise<void> {
    const tabs = await syncTabs(
      this.connectedTabsStore,
      this.requester,
      this.chainId
    );
    try {
      tabs?.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(
          tabId,
          Ports.WebBrowser,
          new UpdatedStakingEventMsg(this.chainId)
        );
      });
    } catch (e) {
      console.warn(e);
    }

    return;
  }
}
