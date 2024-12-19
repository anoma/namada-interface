import { PhraseSize } from "@namada/sdk/web";
import { IndexedDBKVStore, KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  GenDisposableSignerResponse,
  SignArbitraryResponse,
  TxProps,
} from "@namada/types";
import { Result, truncateInMiddle } from "@namada/utils";

import { ApprovalErrors } from "background/approvals";
import { ChainService } from "background/chain";
import { SdkService } from "background/sdk/service";
import { VaultService } from "background/vault";
import { ExtensionBroadcaster, ExtensionRequester } from "extension";
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
    protected readonly chainService: ChainService,
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
      utilityStore,
      localStorage
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
    alias: string,
    flow: "create" | "import",
    path?: Bip44Path
  ): Promise<AccountStore> {
    const results = await this._keyRing.storeAccountSecret(
      accountSecret,
      alias,
      flow,
      path
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
    alias: string,
    parentId: string,
    source: "imported" | "generated"
  ): Promise<DerivedAccount> {
    const account = await this._keyRing.deriveAccount(
      path,
      type,
      alias,
      parentId,
      source
    );
    await this.broadcaster.updateAccounts();
    return account;
  }

  async queryAccountsByParentId(id: string): Promise<DerivedAccount[]> {
    if (await this.vaultService.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    return await this._keyRing.queryAccountsByParentId(id);
  }

  async queryAccounts(): Promise<DerivedAccount[]> {
    if (await this.vaultService.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    return await this._keyRing.queryAllAccounts();
  }

  async queryDefaultAccount(): Promise<DerivedAccount | undefined> {
    if (await this.vaultService.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    return await this._keyRing.queryDefaultAccount();
  }

  async updateDefaultAccount(address: string): Promise<void> {
    await this._keyRing.updateDefaultAccount(address);
    await this.broadcaster.updateAccounts();
  }

  async queryParentAccounts(): Promise<DerivedAccount[]> {
    if (await this.vaultService.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    if (await this.vaultService.isLocked()) {
      return [];
    }
    return [...(await this._keyRing.queryParentAccounts())];
  }

  async findParentByPublicKey(
    publicKey: string
  ): Promise<DerivedAccount | null> {
    if (await this.vaultService.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
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
    const chainId = await this.chainService.getChain();
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
    if (await this.vaultService.isLocked()) {
      throw new Error(ApprovalErrors.KeychainLocked());
    }
    return this._keyRing.queryAccountDetails(address);
  }

  async genDisposableSigner(): Promise<
    GenDisposableSignerResponse | undefined
  > {
    return this._keyRing.genDisposableSigner();
  }
}
