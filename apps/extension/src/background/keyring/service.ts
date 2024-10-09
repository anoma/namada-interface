import { PhraseSize } from "@heliax/namada-sdk/web";
import { IndexedDBKVStore, KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  SignArbitraryResponse,
  TxProps,
} from "@namada/types";
import { Result, truncateInMiddle } from "@namada/utils";

import { fromBase64 } from "@cosmjs/encoding";
import { ChainsService } from "background/chains";
import {
  createOffscreenWithProofWorker,
  GENERATE_PROOF_MSG_TYPE,
  hasOffscreenDocument,
  OFFSCREEN_TARGET,
} from "background/offscreen";
import { SdkService } from "background/sdk/service";
import { VaultService } from "background/vault";
import { init as initProofWorker } from "background/web-workers";
import { SpendingKey } from "background/web-workers/types";
import {
  ExtensionBroadcaster,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { KeyStore, LocalStorage, VaultStorage } from "storage";
import { KeyRing } from "./keyring";
import {
  AccountSecret,
  AccountStore,
  ActiveAccountStore,
  DeleteAccountError,
  MnemonicValidationResponse,
  ParentAccount,
  UtilityStore,
} from "./types";

export class KeyRingService {
  private _keyRing: KeyRing;

  constructor(
    protected readonly vaultService: VaultService,
    protected readonly sdkService: SdkService,
    protected readonly chainsService: ChainsService,
    protected readonly utilityStore: KVStore<UtilityStore>,
    protected readonly localStorage: LocalStorage,
    protected readonly vaultStorage: VaultStorage,
    protected readonly requester: ExtensionRequester,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {
    this._keyRing = new KeyRing(
      vaultService,
      vaultStorage,
      sdkService,
      utilityStore
    );
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
    await this.broadcaster.updateAccounts();
    return results;
  }

  async saveLedger(
    alias: string,
    address: string,
    publicKey: string,
    bip44Path: Bip44Path
  ): Promise<AccountStore | false> {
    const account = await this._keyRing.queryAccountByAddress(address);
    if (account) {
      throw new Error(
        `Keys for ${truncateInMiddle(address, 5, 8)} already imported!`
      );
    }

    const response = await this._keyRing.storeLedger(
      alias,
      address,
      publicKey,
      bip44Path
    );

    await this.broadcaster.updateAccounts();
    return response;
  }

  async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    const account = await this._keyRing.deriveAccount(path, type, alias);
    await this.broadcaster.updateAccounts();
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

  async updateDefaultAccount(address: string): Promise<void> {
    await this._keyRing.updateDefaultAccount(address);
    await this.broadcaster.updateAccounts();
  }

  async queryParentAccounts(): Promise<DerivedAccount[]> {
    return [...(await this._keyRing.queryParentAccounts())];
  }

  async findParentByPublicKey(
    publicKey: string
  ): Promise<DerivedAccount | null> {
    const accounts = await this.vaultStorage.findAll(
      KeyStore,
      "publicKey",
      publicKey
    );
    const account = accounts.find((k) => !k.public.parentId);
    return account?.public ?? null;
  }

  async findByAddress(address: string): Promise<DerivedAccount | null> {
    const account = await this.vaultStorage.findOne(
      KeyStore,
      "address",
      address
    );
    return account?.public ?? null;
  }

  async setActiveAccount(id: string, type: ParentAccount): Promise<void> {
    await this._keyRing.setActiveAccount(id, type);
    await this.broadcaster.updateAccounts();
  }

  async getActiveAccount(): Promise<ActiveAccountStore | undefined> {
    return await this._keyRing.getActiveAccount();
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

  async checkDurability(): Promise<boolean> {
    return await IndexedDBKVStore.durabilityCheck();
  }

  async sign(txProps: TxProps, signer: string): Promise<Uint8Array> {
    const { chainId } = await this.chainsService.getChain();
    return await this._keyRing.sign(txProps, signer, chainId);
  }

  async signArbitrary(
    signer: string,
    data: string
  ): Promise<SignArbitraryResponse | undefined> {
    return await this._keyRing.signArbitrary(signer, data);
  }

  async verifyArbitrary(
    publicKey: string,
    hash: string,
    signature: string
  ): Promise<void> {
    const sdk = this.sdkService.getSdk();

    return sdk.signing.verifyArbitrary(publicKey, hash, signature);
  }

  async queryAccountDetails(
    address: string
  ): Promise<DerivedAccount | undefined> {
    return this._keyRing.queryAccountDetails(address);
  }

  async generateProof(
    proofMsg: string,
    txMsg: string,
    msgId: string
  ): Promise<void> {
    // Passing generate handler simplifies worker code when using Firefox
    const generateHandler = async (spendingKey: SpendingKey): Promise<void> => {
      const { TARGET } = process.env;
      if (TARGET === "chrome") {
        await this.generateProofChrome(proofMsg, txMsg, msgId, spendingKey);
      } else if (TARGET === "firefox") {
        await this.generateProofFirefox(proofMsg, txMsg, msgId, spendingKey);
      } else {
        console.warn("Generating proofs is not supported with your browser.");
      }
    };

    // await this.broadcaster.startTx(msgId, TxType.Transfer);
    try {
      await this._keyRing.generateProof(
        fromBase64(proofMsg),
        generateHandler.bind(this)
      );
      // await this.broadcaster.updateBalance();
    } catch (e) {
      console.warn(e);
      throw new Error(`Unable to generate a proof! ${e}`);
    }
  }

  private async generateProofChrome(
    proofMsg: string,
    txMsg: string,
    msgId: string,
    spendingKey: SpendingKey
  ): Promise<void> {
    const offscreenDocumentPath = "offscreen.html";
    const routerId = await getNamadaRouterId(this.localStorage);
    const {
      currency: { address: nativeToken },
    } = await this.chainsService.getChain();

    if (!(await hasOffscreenDocument(offscreenDocumentPath))) {
      await createOffscreenWithProofWorker(offscreenDocumentPath);
    }

    const result = await chrome.runtime.sendMessage({
      type: GENERATE_PROOF_MSG_TYPE,
      target: OFFSCREEN_TARGET,
      routerId,
      data: { proofMsg, txMsg, msgId, spendingKey, rpc: "", nativeToken },
    });

    if (result?.error) {
      const error = new Error(result.error?.message || "Error in web worker");
      error.stack = result.error.stack;
      throw error;
    }
  }

  private async generateProofFirefox(
    transferMsg: string,
    txMsg: string,
    msgId: string,
    spendingKey: SpendingKey
  ): Promise<void> {
    const {
      currency: { address: nativeToken = "" },
    } = await this.chainsService.getChain();

    initProofWorker(
      {
        transferMsg,
        txMsg,
        msgId,
        spendingKey,
        rpc: "",
        nativeToken,
      },
      this.handleGenerateProofCompleted.bind(this)
    );
  }

  async handleGenerateProofCompleted(
    msgId: string,
    success: boolean,
    payload?: string
  ): Promise<void> {
    console.log("Proof generated!");
    if (success) {
      console.log({ msgId, success, payload });
      // this.broadcaster.sendMsgToTabs(new ProofCompletedMsg(payload))
    }
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
}
