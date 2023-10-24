import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";

import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  TxMsgValue,
} from "@namada/types";
import { ResponseSign } from "@namada/ledger-namada";
import { Sdk, TxType } from "@namada/shared";
import { IStore, KVStore, Store } from "@namada/storage";
import { chains } from "@namada/chains";
import { Result, makeBip44Path } from "@namada/utils";

import {
  AccountStore,
  DeleteAccountError,
  KeyRingService,
  SDK_KEY,
  TabStore,
} from "background/keyring";
import { TxStore } from "background/approvals";
import { encodeSignature, generateId } from "utils";
import { ExtensionBroadcaster, ExtensionRequester } from "extension";

export const LEDGERSTORE_KEY = "ledger-store";
const UUID_NAMESPACE = "be9fdaee-ffa2-11ed-8ef1-325096b39f47";
const REVEALED_PK_STORE = "revealed-pk-store";

export class LedgerService {
  private _ledgerStore: IStore<AccountStore>;

  constructor(
    protected readonly keyringService: KeyRingService,
    protected readonly kvStore: KVStore<AccountStore[]>,
    protected readonly sdkStore: KVStore<Record<string, string>>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly txStore: KVStore<TxStore>,
    protected readonly revealedPKStore: KVStore<string[]>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly requester: ExtensionRequester,
    protected readonly broadcaster: ExtensionBroadcaster
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

      if (!publicKey) {
        throw new Error("Public key not found in txMsg");
      }

      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("publicKey", publicKey);

      if (!account) {
        throw new Error(`Ledger account not found for ${publicKey}`);
      }

      const bytes = await this.sdk.build_tx(
        TxType.RevealPK,
        new Uint8Array(), // TODO: this is a dummy value. Is there a cleaner way?
        fromBase64(txMsg),
        publicKey
      );
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
    const { signature } = signatures;

    if (!signature) {
      throw new Error("Signature not provided");
    }

    try {
      // Serialize signatures
      const sig = encodeSignature(signature);

      const signedTxBytes = await this.sdk.append_signature(
        fromBase64(bytes),
        sig
      );
      await this.sdk.process_tx(
        signedTxBytes,
        fromBase64(txMsg),
        new Uint8Array()
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
    const storeResult = await this.txStore.get(msgId);

    if (!storeResult) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    const { txMsg } = storeResult;

    const { signature } = signatures;

    if (!signature) {
      throw new Error("Signature not provided!");
    }

    // Serialize signatures
    const sig = encodeSignature(signature);

    await this.broadcaster.startTx(msgId, txType);

    try {
      const signedTxBytes = await this.sdk.append_signature(
        fromBase64(bytes),
        sig
      );
      await this.sdk.process_tx(
        signedTxBytes,
        fromBase64(txMsg),
        new Uint8Array()
      );

      // Clear pending tx if successful
      await this.txStore.set(msgId, null);

      // Broadcast update events
      this.broadcaster.completeTx(msgId, txType, true);
      this.broadcaster.updateBalance();

      if ([TxType.Bond, TxType.Unbond, TxType.Withdraw].includes(txType)) {
        this.broadcaster.updateStaking();
      }
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, txType, false, `${e}`);
    }
  }

  async getTxBytes(
    txType: TxType,
    msgId: string,
    address: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const storeResult = await this.txStore.get(msgId);

    if (!storeResult) {
      console.warn(`txMsg not found for msgId: ${msgId}`);
      throw new Error(`Transfer Transaction ${msgId} not found!`);
    }

    const { txMsg, specificMsg } = storeResult;

    const { coinType } = chains[this.chainId].bip44;

    try {
      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("address", address);

      if (!account) {
        throw new Error(`Ledger account not found for ${address}`);
      }

      if (!account.publicKey) {
        throw new Error(`Ledger account missing public key for ${address}`);
      }

      const bytes = await this.sdk.build_tx(
        txType,
        fromBase64(specificMsg),
        fromBase64(txMsg),
        account.publicKey
      );
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
    bip44Path: Bip44Path,
    parentId?: string
  ): Promise<DerivedAccount> {
    // Check if account exists in storage, return if so:
    const record = await this._ledgerStore.getRecord("address", address);
    if (record) {
      return record;
    }

    // Generate a UUID v5 unique id from alias & path
    const id = generateId(UUID_NAMESPACE, alias, address);

    const account = {
      id,
      alias,
      address,
      parentId,
      publicKey,
      owner: address,
      chainId: this.chainId,
      path: bip44Path,
      type: AccountType.Ledger,
    };
    await this._ledgerStore.append(account);

    // Prepare SDK store
    this.sdk.clear_storage();
    await this.keyringService.initSdkStore(id);

    // Set active account ID, triggers account refresh in interface
    await this.keyringService.setActiveAccount(
      parentId || id,
      AccountType.Ledger
    );

    return account;
  }

  async deleteAccount(
    accountId: string
  ): Promise<Result<null, DeleteAccountError>> {
    const derivedAccounts =
      (await this._ledgerStore.getRecords("parentId", accountId)) || [];

    const accountIds = [accountId, ...derivedAccounts.map(({ id }) => id)];

    for (const id of accountIds) {
      id && (await this._ledgerStore.remove(id));
    }

    // remove account from sdk store
    const records = await this.sdkStore.get(SDK_KEY);
    if (records) {
      const { [accountId]: _, ...rest } = records;
      await this.sdkStore.set(SDK_KEY, rest);
    }

    return Result.ok(null);
  }

  async queryStoredRevealedPK(publicKey: string): Promise<boolean> {
    const pks = await this.revealedPKStore.get(REVEALED_PK_STORE);
    return pks?.includes(publicKey) || false;
  }

  async storeRevealedPK(publicKey: string): Promise<void> {
    const pks = (await this.revealedPKStore.get(REVEALED_PK_STORE)) || [];
    if (!pks.includes(publicKey)) {
      pks.push(publicKey);
    }
    await this.revealedPKStore.set(REVEALED_PK_STORE, pks);
  }
}
