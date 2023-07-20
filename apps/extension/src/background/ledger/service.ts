import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";

import {
  AccountType,
  Bip44Path,
  SubmitBondMsgValue,
  SubmitRevealPKMsgValue,
  TransferMsgValue,
} from "@namada/types";
import { ResponseSign } from "@namada/ledger-namada";
import { Sdk } from "@namada/shared";
import { IStore, KVStore, Store } from "@namada/storage";
import { chains } from "@namada/chains";
import { makeBip44Path } from "@namada/utils";

import {
  AccountStore,
  KeyRingService,
  TabStore,
  syncTabs,
} from "background/keyring";
import { generateId } from "utils";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { UpdatedStakingEventMsg } from "content/events";

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
        SubmitRevealPKMsgValue
      );

      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("publicKey", publicKey);

      if (!account) {
        throw new Error(`Ledger account not found for ${publicKey}`);
      }

      const bytes = await this.sdk.build_reveal_pk(fromBase64(txMsg));
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
    const {
      wrapperSignature: {
        raw: { data: wrapperSig },
      },
      rawSignature: {
        raw: { data: rawSig },
      },
      // TODO: We need the correct type updated in ResponseSign
    } = signatures as any; // eslint-disable-line

    if (!wrapperSig) {
      throw new Error("No wrapper signature was produced!");
    }

    if (!rawSig) {
      throw new Error("No raw signature was produced!");
    }

    try {
      await this.sdk.submit_signed_reveal_pk(
        fromBase64(txMsg),
        fromBase64(bytes),
        new Uint8Array(wrapperSig),
        new Uint8Array(rawSig)
      );
    } catch (e) {
      console.warn(e);
    }
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
        Buffer.from(fromBase64(txMsg)),
        TransferMsgValue
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
    signatures: ResponseSign
  ): Promise<void> {
    const txMsg = await this.txStore.get(msgId);

    if (!txMsg) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    const {
      wrapperSignature: {
        raw: { data: wrapperSig },
      },
      rawSignature: {
        raw: { data: rawSig },
      },
      // TODO: We need the correct type updated in ResponseSign
    } = signatures as any; // eslint-disable-line

    if (!wrapperSig) {
      throw new Error("No wrapper signature was produced!");
    }

    if (!rawSig) {
      throw new Error("No raw signature was produced!");
    }

    try {
      await this.sdk.submit_signed_transfer(
        fromBase64(txMsg),
        fromBase64(bytes),
        new Uint8Array(wrapperSig),
        new Uint8Array(rawSig)
      );

      // Clear pending tx if successful
      await this.txStore.set(msgId, null);
    } catch (e) {
      console.warn(e);
    }
  }

  async getBondBytes(
    msgId: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const txMsg = await this.txStore.get(msgId);

    if (!txMsg) {
      console.warn(`txMsg not found for msgId: ${msgId}`);
      throw new Error(`Transfer Transaction ${msgId} not found!`);
    }

    const { coinType } = chains[this.chainId].bip44;

    try {
      // Deserialize txMsg to retrieve source
      const { source } = deserialize(
        Buffer.from(fromBase64(txMsg)),
        SubmitBondMsgValue
      );

      // Query account from Ledger storage to determine path for signer
      const account = await this._ledgerStore.getRecord("address", source);

      if (!account) {
        throw new Error(`Ledger account not found for ${source}`);
      }

      const bytes = await this.sdk.build_bond(fromBase64(txMsg));
      const path = makeBip44Path(coinType, account.path);

      return { bytes, path };
    } catch (e) {
      console.warn(e);
      throw new Error(`${e}`);
    }
  }

  /* Submit a bond with provided signatures */
  async submitBond(
    msgId: string,
    bytes: string,
    signatures: ResponseSign
  ): Promise<void> {
    const txMsg = await this.txStore.get(msgId);

    if (!txMsg) {
      throw new Error(`Bond Transaction ${msgId} not found!`);
    }

    const {
      wrapperSignature: {
        raw: { data: wrapperSig },
      },
      rawSignature: {
        raw: { data: rawSig },
      },
      // TODO: We need the correct type updated in ResponseSign
    } = signatures as any; // eslint-disable-line

    if (!wrapperSig) {
      throw new Error("No wrapper signature was produced!");
    }

    if (!rawSig) {
      throw new Error("No raw signature was produced!");
    }

    try {
      await this.sdk.submit_signed_bond(
        fromBase64(txMsg),
        fromBase64(bytes),
        new Uint8Array(wrapperSig),
        new Uint8Array(rawSig)
      );

      await this.broadcastUpdateStaking();

      // Clear pending tx if successful
      await this.txStore.set(msgId, null);
    } catch (e) {
      console.warn(e);
    }

    await this.keyring.broadcastUpdateBalance();
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
