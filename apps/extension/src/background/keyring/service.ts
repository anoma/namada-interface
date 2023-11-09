import { fromBase64 } from "@cosmjs/encoding";

import { PhraseSize } from "@namada/crypto";
import { Query, Sdk, TxType } from "@namada/shared";
import { IndexedDBKVStore, KVStore } from "@namada/storage";
import { AccountType, Bip44Path, DerivedAccount } from "@namada/types";
import { Result } from "@namada/utils";

import {
  createOffscreenWithTxWorker,
  hasOffscreenDocument,
  OFFSCREEN_TARGET,
  SUBMIT_TRANSFER_MSG_TYPE,
} from "background/offscreen";
import { VaultService } from "background/vault";
import { init as initSubmitTransferWebWorker } from "background/web-workers";
import {
  ExtensionBroadcaster,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { KeyRing, KEYSTORE_KEY } from "./keyring";
import {
  AccountStore,
  ActiveAccountStore,
  DeleteAccountError,
  ParentAccount,
  TabStore,
  UtilityStore,
} from "./types";
import { syncTabs, updateTabStorage } from "./utils";

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(
    //protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly vaultService: VaultService,
    protected readonly sdkStore: KVStore<Record<string, string>>,
    protected readonly utilityStore: KVStore<UtilityStore>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly query: Query,
    protected readonly cryptoMemory: WebAssembly.Memory,
    protected readonly requester: ExtensionRequester,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {
    this._keyRing = new KeyRing(
      vaultService,
      sdkStore,
      utilityStore,
      extensionStore,
      chainId,
      sdk,
      query,
      cryptoMemory
    );
  }

  // Track connected tabs by ID
  async connect(senderTabId: number, chainId: string): Promise<void> {
    // Validate chainId, if valid, append tab unless it already exists
    if (chainId === this.chainId) {
      const tabs = await syncTabs(
        this.connectedTabsStore,
        this.requester,
        this.chainId
      );

      return await updateTabStorage(
        senderTabId,
        tabs,
        this.connectedTabsStore,
        this.chainId
      );
    }
    throw new Error("Connect: Invalid chainId");
  }

  async generateMnemonic(size?: PhraseSize): Promise<string[]> {
    return await this._keyRing.generateMnemonic(size);
  }

  validateMnemonic(phrase: string): boolean {
    return this._keyRing.validateMnemonic(phrase);
  }

  async saveMnemonic(
    words: string[],
    alias: string
  ): Promise<AccountStore | false> {
    const results = await this._keyRing.storeMnemonic(words, alias);
    this.broadcaster.updateAccounts();
    return results;
  }

  async scanAccounts(): Promise<void> {
    await this._keyRing.scanAddresses();
    this.broadcaster.updateAccounts();
  }

  async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    const account = await this._keyRing.deriveAccount(path, type, alias);
    this.broadcaster.updateAccounts();
    return account;
  }

  async queryAccountById(id: string): Promise<DerivedAccount[]> {
    return await this._keyRing.queryAccounts(id);
  }

  async queryAccounts(): Promise<DerivedAccount[]> {
    const { id } = (await this.getActiveAccount()) || {};
    if (!id) {
      return [];
    }
    return await this.queryAccountById(id);
  }

  async queryParentAccounts(): Promise<DerivedAccount[]> {
    return [...(await this._keyRing.queryParentAccounts())];
  }

  async submitBond(
    bondMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    await this.broadcaster.startTx(msgId, TxType.Bond);
    try {
      await this._keyRing.submitBond(fromBase64(bondMsg), fromBase64(txMsg));
      this.broadcaster.completeTx(msgId, TxType.Bond, true);
      this.broadcaster.updateStaking();
      this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, TxType.Bond, false, `${e}`);
      throw new Error(`Unable to submit bond tx! ${e}`);
    }
  }

  async submitUnbond(
    unbondMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    await this.broadcaster.startTx(msgId, TxType.Unbond);
    try {
      await this._keyRing.submitUnbond(
        fromBase64(unbondMsg),
        fromBase64(txMsg)
      );
      this.broadcaster.completeTx(msgId, TxType.Unbond, true);
      this.broadcaster.updateStaking();
      this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, TxType.Unbond, false, `${e}`);
      throw new Error(`Unable to submit unbond tx! ${e}`);
    }
  }

  async submitWithdraw(
    withdrawMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    await this.broadcaster.startTx(msgId, TxType.Withdraw);
    try {
      await this._keyRing.submitWithdraw(
        fromBase64(withdrawMsg),
        fromBase64(txMsg)
      );
      this.broadcaster.completeTx(msgId, TxType.Withdraw, true);
      this.broadcaster.updateStaking();
      this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, TxType.Withdraw, false, `${e}`);
      throw new Error(`Unable to submit withdraw tx! ${e}`);
    }
  }

  async submitVoteProposal(
    voteProposalMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    await this.broadcaster.startTx(msgId, TxType.VoteProposal);
    try {
      await this._keyRing.submitVoteProposal(
        fromBase64(voteProposalMsg),
        fromBase64(txMsg)
      );
      this.broadcaster.completeTx(msgId, TxType.VoteProposal, true);
      this.broadcaster.updateProposals();
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, TxType.VoteProposal, false, `${e}`);
      throw new Error(`Unable to submit vote proposal tx! ${e}`);
    }
  }

  private async submitTransferChrome(
    transferMsg: string,
    txMsg: string,
    msgId: string,
    password: string,
    xsk?: string
  ): Promise<void> {
    const offscreenDocumentPath = "offscreen.html";
    const routerId = await getNamadaRouterId(this.extensionStore);

    if (!(await hasOffscreenDocument(offscreenDocumentPath))) {
      await createOffscreenWithTxWorker(offscreenDocumentPath);
    }

    const result = await chrome.runtime.sendMessage({
      type: SUBMIT_TRANSFER_MSG_TYPE,
      target: OFFSCREEN_TARGET,
      routerId,
      data: { transferMsg, txMsg, msgId, password, xsk },
    });

    if (result?.error) {
      const error = new Error(result.error?.message || "Error in web worker");
      error.stack = result.error.stack;
      throw error;
    }
  }

  private async submitTransferFirefox(
    transferMsg: string,
    txMsg: string,
    msgId: string,
    password: string,
    xsk?: string
  ): Promise<void> {
    initSubmitTransferWebWorker(
      {
        transferMsg,
        txMsg,
        msgId,
        password,
        xsk,
      },
      this.handleTransferCompleted.bind(this)
    );
  }

  /**
   * Submits a transfer transaction to the chain.
   * Handles both Shielded and Transparent transfers.
   *
   * @async
   * @param {string} txMsg - borsh serialized transfer transaction
   * @param {string} msgId - id of a tx if originating from approval process
   * @throws {Error} - if unable to submit transfer
   * @returns {Promise<void>} - resolves when transfer is successfull (resolves for failed VPs)
   */
  async submitTransfer(
    transferMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    // Passing submit handler simplifies worker code when using Firefox
    const submit = async (password: string, xsk?: string): Promise<void> => {
      const { TARGET } = process.env;
      if (TARGET === "chrome") {
        this.submitTransferChrome(transferMsg, txMsg, msgId, password, xsk);
      } else if (TARGET === "firefox") {
        this.submitTransferFirefox(transferMsg, txMsg, msgId, password, xsk);
      } else {
        console.warn(
          "Submitting transfers is not supported with your browser."
        );
      }
    };

    await this.broadcaster.startTx(msgId, TxType.Transfer);

    try {
      await this._keyRing.submitTransfer(
        fromBase64(transferMsg),
        submit.bind(this)
      );
      this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to submit the transfer! ${e}`);
    }
  }

  async submitIbcTransfer(
    ibcTransferMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    await this.broadcaster.startTx(msgId, TxType.IBCTransfer);

    try {
      await this._keyRing.submitIbcTransfer(
        fromBase64(ibcTransferMsg),
        fromBase64(txMsg)
      );
      this.broadcaster.completeTx(msgId, TxType.IBCTransfer, true);
      this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, TxType.IBCTransfer, false, `${e}`);
      throw new Error(`Unable to encode IBC transfer! ${e}`);
    }
  }

  async submitEthBridgeTransfer(
    ethBridgeTransferMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    await this.broadcaster.startTx(msgId, TxType.EthBridgeTransfer);

    try {
      await this._keyRing.submitEthBridgeTransfer(
        fromBase64(ethBridgeTransferMsg),
        fromBase64(txMsg)
      );
      this.broadcaster.completeTx(msgId, TxType.EthBridgeTransfer, true);
      this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(
        msgId,
        TxType.EthBridgeTransfer,
        false,
        `${e}`
      );
      throw new Error(`Unable to encode Eth Bridge transfer! ${e}`);
    }
  }

  async setActiveAccount(id: string, type: ParentAccount): Promise<void> {
    await this._keyRing.setActiveAccount(id, type);
    this.broadcaster.updateAccounts();
  }

  async getActiveAccount(): Promise<ActiveAccountStore | undefined> {
    return await this._keyRing.getActiveAccount();
  }

  async handleTransferCompleted(
    msgId: string,
    success: boolean,
    payload?: string
  ): Promise<void> {
    await this.broadcaster.completeTx(msgId, TxType.Transfer, success, payload);
    this.broadcaster.updateBalance();
  }

  closeOffscreenDocument(): Promise<void> {
    if (chrome) {
      return chrome.offscreen.closeDocument();
    } else {
      return Promise.reject(
        "Trying to close offscreen document for nor supported browser"
      );
    }
  }

  async deleteAccount(
    accountId: string,
    password: string
  ): Promise<Result<null, DeleteAccountError>> {
    return await this._keyRing.deleteAccount(accountId, password);
  }

  async fetchAndStoreMaspParams(): Promise<void> {
    await Sdk.fetch_and_store_masp_params();
  }

  async hasMaspParams(): Promise<boolean> {
    return Sdk.has_masp_params();
  }

  async queryBalances(
    address: string
  ): Promise<{ token: string; amount: string }[]> {
    const account = await this.vaultService.findOneOrFail<AccountStore>(
      KEYSTORE_KEY,
      "address",
      address
    );
    return this._keyRing.queryBalances(account.public.owner);
  }

  async initSdkStore(activeAccountId: string): Promise<void> {
    return await this._keyRing.initSdkStore(activeAccountId);
  }

  async queryPublicKey(address: string): Promise<string | undefined> {
    return await this.query.query_public_key(address);
  }

  async checkDurability(): Promise<boolean> {
    return await IndexedDBKVStore.durabilityCheck();
  }
}
