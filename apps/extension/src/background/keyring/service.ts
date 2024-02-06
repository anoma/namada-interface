import { fromBase64, fromHex } from "@cosmjs/encoding";

import { PhraseSize } from "@namada/crypto";
import { public_key_to_bech32, Sdk, TxType } from "@namada/shared";
import { IndexedDBKVStore, KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  SignatureResponse,
} from "@namada/types";
import { Result, truncateInMiddle } from "@namada/utils";

import { ChainsService } from "background/chains";
import {
  createOffscreenWithTxWorker,
  hasOffscreenDocument,
  OFFSCREEN_TARGET,
  SUBMIT_TRANSFER_MSG_TYPE,
} from "background/offscreen";
import { SdkService } from "background/sdk/service";
import { VaultService } from "background/vault";
import { init as initSubmitTransferWebWorker } from "background/web-workers";
import {
  ExtensionBroadcaster,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { KeyRing, KEYSTORE_KEY } from "./keyring";
import {
  AccountSecret,
  AccountStore,
  ActiveAccountStore,
  DeleteAccountError,
  MnemonicValidationResponse,
  ParentAccount,
  SigningKey,
  TabStore,
  UtilityStore,
} from "./types";
import { syncTabs, updateTabStorage } from "./utils";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
  tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(
    protected readonly vaultService: VaultService,
    protected readonly sdkService: SdkService,
    protected readonly chainsService: ChainsService,
    protected readonly utilityStore: KVStore<UtilityStore>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly cryptoMemory: WebAssembly.Memory,
    protected readonly requester: ExtensionRequester,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {
    this._keyRing = new KeyRing(
      vaultService,
      sdkService,
      utilityStore,
      extensionStore,
      cryptoMemory
    );
  }

  // Track connected tabs by ID
  async connect(senderTabId: number): Promise<void> {
    const tabs = await syncTabs(this.connectedTabsStore, this.requester);

    return await updateTabStorage(senderTabId, tabs, this.connectedTabsStore);
  }

  async generateMnemonic(size?: PhraseSize): Promise<string[]> {
    return await this._keyRing.generateMnemonic(size);
  }

  validateMnemonic(phrase: string): MnemonicValidationResponse {
    return this._keyRing.validateMnemonic(phrase);
  }

  async revealAccountMnemonic(accountId: string): Promise<string> {
    return await this._keyRing.revealMnemonic(accountId);
  }

  async saveAccountSecret(
    accountSecret: AccountSecret,
    alias: string
  ): Promise<AccountStore> {
    const results = await this._keyRing.storeAccountSecret(
      accountSecret,
      alias
    );
    this.broadcaster.updateAccounts();
    return results;
  }

  async saveLedger(
    alias: string,
    address: string,
    publicKey: string,
    bip44Path: Bip44Path
  ): Promise<AccountStore | false> {
    const publicKeyBytes = fromHex(publicKey);
    const bech32PublicKey = public_key_to_bech32(publicKeyBytes);

    const account = await this._keyRing.queryAccountByAddress(address);
    if (account) {
      throw new Error(
        `Keys for ${truncateInMiddle(address, 5, 8)} already imported!`
      );
    }

    const response = await this._keyRing.storeLedger(
      alias,
      address,
      bech32PublicKey,
      bip44Path
    );

    await this.broadcaster.updateAccounts();
    return response;
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
    return await this._keyRing.queryAccountById(id);
  }

  async queryAccounts(): Promise<DerivedAccount[]> {
    return await this._keyRing.queryAllAccounts();
  }

  async queryDefaultAccount(): Promise<DerivedAccount | undefined> {
    return await this._keyRing.queryDefaultAccount();
  }

  async queryParentAccounts(): Promise<DerivedAccount[]> {
    return [...(await this._keyRing.queryParentAccounts())];
  }

  async findParentByPublicKey(
    publicKey: string
  ): Promise<DerivedAccount | null> {
    const accounts = await this.vaultService.findAll<DerivedAccount>(
      KEYSTORE_KEY,
      "publicKey",
      publicKey
    );
    const account = accounts.find((k) => !k.public.parentId);
    return account?.public ?? null;
  }

  async findByAddress(address: string): Promise<DerivedAccount | null> {
    const account = await this.vaultService.findOne<DerivedAccount>(
      KEYSTORE_KEY,
      "address",
      address
    );
    return account?.public ?? null;
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
    signingKey: SigningKey
  ): Promise<void> {
    const offscreenDocumentPath = "offscreen.html";
    const routerId = await getNamadaRouterId(this.extensionStore);
    const rpc = await this.sdkService.getRpc();
    const {
      currency: { address: nativeToken = tokenAddress },
    } = await this.chainsService.getChain();

    if (!(await hasOffscreenDocument(offscreenDocumentPath))) {
      await createOffscreenWithTxWorker(offscreenDocumentPath);
    }

    const result = await chrome.runtime.sendMessage({
      type: SUBMIT_TRANSFER_MSG_TYPE,
      target: OFFSCREEN_TARGET,
      routerId,
      data: { transferMsg, txMsg, msgId, signingKey, rpc, nativeToken },
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
    signingKey: SigningKey
  ): Promise<void> {
    const rpc = await this.sdkService.getRpc();
    const {
      currency: { address: nativeToken = tokenAddress },
    } = await this.chainsService.getChain();

    initSubmitTransferWebWorker(
      {
        transferMsg,
        txMsg,
        msgId,
        signingKey,
        rpc,
        nativeToken,
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
   * @returns {Promise<void>} - resolves when transfer is successful (resolves for failed VPs)
   */
  async submitTransfer(
    transferMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    // Passing submit handler simplifies worker code when using Firefox
    const submit = async (signingKey: SigningKey): Promise<void> => {
      const { TARGET } = process.env;
      if (TARGET === "chrome") {
        this.submitTransferChrome(transferMsg, txMsg, msgId, signingKey);
      } else if (TARGET === "firefox") {
        this.submitTransferFirefox(transferMsg, txMsg, msgId, signingKey);
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
    accountId: string
  ): Promise<Result<null, DeleteAccountError>> {
    return await this._keyRing.deleteAccount(accountId);
  }

  async renameAccount(
    accountId: string,
    alias: string
  ): Promise<DerivedAccount> {
    return await this._keyRing.renameAccount(accountId, alias);
  }

  async fetchAndStoreMaspParams(): Promise<void> {
    await Sdk.fetch_and_store_masp_params();
  }

  async hasMaspParams(): Promise<boolean> {
    return Sdk.has_masp_params();
  }

  async queryBalances(
    owner: string,
    tokens: string[]
  ): Promise<{ token: string; amount: string }[]> {
    const account = await this.vaultService.findOneOrFail<AccountStore>(
      KEYSTORE_KEY,
      "address",
      owner
    );
    return this._keyRing.queryBalances(account.public.owner, tokens);
  }

  async queryPublicKey(address: string): Promise<string | undefined> {
    return await this._keyRing.queryPublicKey(address);
  }

  async checkDurability(): Promise<boolean> {
    return await IndexedDBKVStore.durabilityCheck();
  }

  async signArbitrary(
    signer: string,
    data: string
  ): Promise<SignatureResponse | undefined> {
    return await this._keyRing.signArbitrary(signer, data);
  }

  async verifyArbitrary(
    publicKey: string,
    hash: string,
    signature: string
  ): Promise<void> {
    const sdk = await this.sdkService.getSdk();

    return sdk.verify_arbitrary(publicKey, hash, signature);
  }
}
