import { fromBase64, toHex } from "@cosmjs/encoding";
import { deserialize } from "borsh";
import { ResponseSign } from "@zondax/ledger-namada";

import {
  AccountType,
  Bip44Path,
  SubmitTransferMsgSchema,
  TransferMsgValue,
} from "@anoma/types";
import { Sdk } from "@anoma/shared";
import { IStore, KVStore, Store } from "@anoma/storage";
import { chains } from "@anoma/chains";
import { makeBip44Path } from "@anoma/utils";

import { AccountStore, KeyRingService, TabStore } from "background/keyring";
import { generateId } from "utils";

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
    protected readonly sdk: Sdk
  ) {
    this._ledgerStore = new Store(LEDGERSTORE_KEY, kvStore);
  }

  async getTransferBytes(
    msgId: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const txMsg = await this.txStore.get(msgId);
    const { coinType } = chains[this.chainId].bip44;

    if (!txMsg) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    try {
      // Deserialize txMsg to retrieve source
      const { source } = deserialize(
        SubmitTransferMsgSchema,
        TransferMsgValue,
        Buffer.from(fromBase64(txMsg))
      );

      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("address", source);

      if (!account) {
        throw new Error(`Ledger account not found for ${source}`);
      }

      const bytes = await this.sdk.build_transfer(fromBase64(txMsg));
      const path = makeBip44Path(coinType, account.path);

      return { bytes, path };
    } catch (e) {
      console.warn(e);
      throw new Error(`${e}`);
    }
  }

  async submitTransfer(
    msgId: string,
    bytes: string,
    signatures: ResponseSign,
    publicKey: string
  ): Promise<void> {
    const txMsg = await this.txStore.get(msgId);

    if (!txMsg) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    const { headerSignature, dataSignature } = signatures;

    const signedTransfer = await this.sdk.sign_tx(
      fromBase64(bytes),
      toHex(dataSignature.signature),
      toHex(headerSignature.signature)
    );

    try {
      await this.sdk.submit_signed_transfer(
        publicKey,
        fromBase64(txMsg),
        signedTransfer
      );

      // Clear pending tx if successful
      await this.txStore.set(msgId, null);
    } catch (e) {
      console.warn(e);
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
}
