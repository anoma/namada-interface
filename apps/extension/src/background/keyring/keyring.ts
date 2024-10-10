import { PhraseSize } from "@heliaxdev/namada-sdk/web";
import { KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  SignArbitraryResponse,
  TxProps,
} from "@namada/types";
import { Result, assertNever, truncateInMiddle } from "@namada/utils";

import {
  AccountSecret,
  AccountStore,
  ActiveAccountStore,
  DeleteAccountError,
  KeyRingStatus,
  MnemonicValidationResponse,
  SensitiveAccountStoreData,
  UtilityStore,
} from "./types";

import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
import { KeyStore, KeyStoreType, SensitiveType, VaultStorage } from "storage";
import { generateId } from "utils";

// Generated UUID namespace for uuid v5
const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

export const KEYSTORE_KEY = "key-store";
export const PARENT_ACCOUNT_ID_KEY = "parent-account-id";
export const AUTHKEY_KEY = "auth-key-store";

type DerivedAccountInfo = {
  address: string;
  id: string;
  text: string;
  owner: string;
};

/**
 * Keyring stores keys in persisted background.
 */
export class KeyRing {
  private _status: KeyRingStatus = KeyRingStatus.Empty;

  constructor(
    protected readonly vaultService: VaultService,
    protected readonly vaultStorage: VaultStorage,
    protected readonly sdkService: SdkService,
    protected readonly utilityStore: KVStore<UtilityStore>
  ) {}

  public get status(): KeyRingStatus {
    return this._status;
  }

  public async getActiveAccount(): Promise<ActiveAccountStore | undefined> {
    return await this.utilityStore.get(PARENT_ACCOUNT_ID_KEY);
  }

  public async setActiveAccount(
    id: string,
    type: AccountType.Mnemonic | AccountType.Ledger | AccountType.PrivateKey
  ): Promise<void> {
    await this.utilityStore.set(PARENT_ACCOUNT_ID_KEY, { id, type });
  }

  public validateMnemonic(phrase: string): MnemonicValidationResponse {
    const mnemonic = this.sdkService.getSdk().getMnemonic();
    const isValid = mnemonic.validateMnemonic(phrase);

    return isValid;
  }

  // Return new mnemonic to client for validation
  public async generateMnemonic(
    size: PhraseSize = PhraseSize.N12
  ): Promise<string[]> {
    const mnemonic = this.sdkService.getSdk().getMnemonic();
    const words = mnemonic.generate(size);

    return words;
  }

  public async storeLedger(
    alias: string,
    address: string,
    publicKey: string,
    bip44Path: Bip44Path
  ): Promise<AccountStore | false> {
    const id = generateId(UUID_NAMESPACE, alias, address);
    const accountStore: AccountStore = {
      id,
      alias,
      address,
      publicKey,
      owner: address,
      path: bip44Path,
      type: AccountType.Ledger,
    };

    const sensitive = await this.vaultService.encryptSensitiveData({
      text: "",
      passphrase: "",
    });
    await this.vaultStorage.add(KeyStore, {
      public: accountStore,
      sensitive,
    });

    await this.setActiveAccount(id, AccountType.Ledger);
    return accountStore;
  }

  public async revealMnemonic(accountId: string): Promise<string> {
    const account = await this.vaultStorage.findOneOrFail(
      KeyStore,
      "id",
      accountId
    );

    if (account.public.type !== AccountType.Mnemonic) {
      throw new Error("Account should have be created using a mnemonic test.");
    }

    const sensitiveData =
      await this.vaultService.reveal<SensitiveAccountStoreData>(
        account.sensitive
      );

    if (!sensitiveData) {
      return "";
    }

    return sensitiveData.text;
  }

  // Store validated mnemonic or private key
  public async storeAccountSecret(
    accountSecret: AccountSecret,
    alias: string
  ): Promise<AccountStore> {
    await this.vaultService.assertIsUnlocked();

    const path = { account: 0, change: 0, index: 0 };
    const keys = this.sdkService.getSdk().getKeys();

    const { sk, text, passphrase, accountType } = ((): {
      sk: string;
      text: string;
      passphrase: string;
      accountType: AccountType;
    } => {
      switch (accountSecret.t) {
        case "Mnemonic":
          const phrase = accountSecret.seedPhrase.join(" ");
          const transparentKeys = keys.deriveFromMnemonic(
            phrase,
            path,
            accountSecret.passphrase
          );

          return {
            sk: transparentKeys.privateKey,
            text: phrase,
            passphrase: accountSecret.passphrase,
            accountType: AccountType.Mnemonic,
          };

        case "PrivateKey":
          const { privateKey } = accountSecret;

          return {
            sk: privateKey,
            text: privateKey,
            passphrase: "",
            accountType: AccountType.PrivateKey,
          };

        default:
          return assertNever(accountSecret);
      }
    })();

    const { address, publicKey } = keys.getAddress(sk);

    // Check whether keys already exist for this account
    const account = await this.queryAccountByAddress(address);
    if (account) {
      throw new Error(
        `Keys for ${truncateInMiddle(address, 5, 8)} already imported!`
      );
    }

    // Generate unique ID for new parent account:
    const id = generateId(
      UUID_NAMESPACE,
      text,
      await this.vaultService.getLength(KEYSTORE_KEY)
    );

    const accountStore: AccountStore = {
      id,
      alias,
      address,
      owner: address,
      path,
      publicKey,
      type: accountType,
    };
    const sensitiveData: SensitiveAccountStoreData = { text, passphrase };
    const sensitive =
      await this.vaultService.encryptSensitiveData(sensitiveData);

    await this.vaultStorage.add(KeyStore, {
      public: accountStore,
      sensitive,
    });
    await this.setActiveAccount(id, AccountType.Mnemonic);
    return accountStore;
  }

  public deriveTransparentAccount(
    seed: Uint8Array,
    path: Bip44Path,
    parentId: string
  ): DerivedAccountInfo {
    const keysNs = this.sdkService.getSdk().getKeys();
    const { address, privateKey } = keysNs.deriveFromSeed(seed, path);

    const { account, change, index } = path;
    const id = generateId(
      UUID_NAMESPACE,
      "account",
      parentId,
      account,
      change,
      index
    );

    return {
      address,
      owner: address,
      id,
      text: privateKey,
    };
  }

  public deriveShieldedAccount(
    seed: Uint8Array,
    path: Bip44Path,
    parentId: string
  ): DerivedAccountInfo {
    const { index } = path;
    const id = generateId(UUID_NAMESPACE, "shielded-account", parentId, index);
    const keysNs = this.sdkService.getSdk().getKeys();
    const { address, viewingKey, spendingKey } = keysNs.deriveShieldedFromSeed(
      seed,
      path
    );

    return {
      address,
      id,
      owner: viewingKey,
      text: JSON.stringify({ spendingKey }),
    };
  }

  private async getParentSeed(): Promise<{
    parentId: string;
    seed: Uint8Array;
  }> {
    const activeAccount = await this.getActiveAccount();

    if (!activeAccount) {
      throw "No active account has been found";
    }

    const storedMnemonic = await this.vaultStorage.findOneOrFail(
      KeyStore,
      "id",
      activeAccount.id
    );

    const parentId = storedMnemonic.public.id;
    try {
      const sensitiveData =
        await this.vaultService.reveal<SensitiveAccountStoreData>(
          storedMnemonic.sensitive
        );

      if (!sensitiveData) {
        throw new Error(
          "Returned an empty value while decrypting mnemonic from password"
        );
      }

      const { text, passphrase } = sensitiveData;

      const mnemonicSdk = this.sdkService.getSdk().getMnemonic();
      const seed = mnemonicSdk.toSeed(text, passphrase);

      return { parentId, seed };
    } catch (e) {
      console.error(e);
      throw Error("Could not decrypt mnemonic using the provided password");
    }
  }

  private async persistAccount(
    path: Bip44Path,
    parentId: string,
    type: AccountType,
    alias: string,
    derivedAccountInfo: DerivedAccountInfo
  ): Promise<DerivedAccount> {
    const { address, id, text, owner } = derivedAccountInfo;
    const account: AccountStore = {
      id,
      address,
      alias,
      parentId,
      path,
      type,
      owner,
    };
    const sensitive = await this.vaultService.encryptSensitiveData({
      text,
      passphrase: "",
    });
    await this.vaultStorage.add(KeyStore, {
      public: { ...account, owner },
      sensitive,
    });
    return account;
  }

  public async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    await this.vaultService.assertIsUnlocked();

    if (type !== AccountType.PrivateKey && type !== AccountType.ShieldedKeys) {
      throw new Error("Unsupported account type");
    }

    const deriveFn = (
      type === AccountType.PrivateKey ?
        this.deriveTransparentAccount
      : this.deriveShieldedAccount).bind(this);

    const { seed, parentId } = await this.getParentSeed();
    const info = deriveFn(seed, path, parentId);

    // Check whether keys already exist for this account
    const existingAccount = await this.queryAccountByAddress(info.address);
    if (existingAccount) {
      throw new Error(
        `Keys for ${truncateInMiddle(info.address, 5, 8)} already imported!`
      );
    }

    const derivedAccount = await this.persistAccount(
      path,
      parentId,
      type,
      alias,
      info
    );
    return derivedAccount;
  }

  public async queryAllAccounts(): Promise<DerivedAccount[]> {
    const accounts = await this.vaultStorage.findAll(KeyStore);
    return accounts.map((entry) => entry.public as AccountStore);
  }

  /**
   * Query accounts from storage (active parent account + associated derived child accounts)
   */
  public async queryAccountById(accountId: string): Promise<DerivedAccount[]> {
    const parentAccount = await this.vaultStorage.findOne(
      KeyStore,
      "id",
      accountId
    );

    const derivedAccounts =
      (await this.vaultStorage.findAll(KeyStore, "parentId", accountId)) || [];

    if (parentAccount) {
      const accounts = [parentAccount, ...derivedAccounts];
      return accounts.map((entry) => entry.public as AccountStore);
    }

    return [];
  }

  public async queryDefaultAccount(): Promise<DerivedAccount | undefined> {
    const accounts = await this.queryAllAccounts();
    const activeAccount = await this.getActiveAccount();

    return accounts.find((acc) => acc.id === activeAccount?.id);
  }

  public async updateDefaultAccount(address: string): Promise<void> {
    const account = await this.queryAccountDetails(address);
    if (!account) {
      throw new Error(`Account with address ${address} not found.`);
    }
    if (account.type === AccountType.ShieldedKeys) {
      throw new Error(`Cannot use this account type: ${account.type}`);
    }
    const { id, type } = account;
    await this.setActiveAccount(id, type);
  }

  public async queryAccountByPublicKey(
    publicKey: string
  ): Promise<DerivedAccount[]> {
    const parentAccount = await this.vaultStorage.findOne(
      KeyStore,
      "publicKey",
      publicKey
    );

    const derivedAccounts =
      (await this.vaultStorage.findAll(
        KeyStore,
        "parentId",
        parentAccount?.public.id
      )) || [];

    if (parentAccount) {
      const accounts = [parentAccount, ...derivedAccounts];
      return accounts.map((entry) => entry.public as AccountStore);
    }

    return [];
  }

  /**
   * Query all top-level parent accounts (mnemonic accounts)
   */
  public async queryParentAccounts(): Promise<DerivedAccount[]> {
    const accounts =
      (await this.vaultStorage.findAll(
        KeyStore,
        "type",
        AccountType.Mnemonic
      )) || [];
    return accounts.map((account) => account.public as AccountStore);
  }

  /**
   * For provided address, return associated private key
   */
  private async getSigningKey(address: string): Promise<string> {
    const account = await this.vaultStorage.findOne(
      KeyStore,
      "address",
      address
    );
    if (!account) {
      throw new Error(`Account for ${address} not found!`);
    }
    const accountStore = (await this.queryAllAccounts()).find(
      (account) => account.address === address
    );

    if (!accountStore) {
      throw new Error(`Account for ${address} not found!`);
    }
    const { path } = accountStore;

    const sensitiveProps =
      await this.vaultService.reveal<SensitiveAccountStoreData>(
        account.sensitive
      );
    if (!sensitiveProps) {
      throw new Error(`Signing key for ${address} not found!`);
    }
    const { text: secret, passphrase } = sensitiveProps;

    let privateKey: string;

    if (account.public.type === AccountType.PrivateKey) {
      privateKey = secret;
    } else {
      const sdk = this.sdkService.getSdk();
      const mnemonic = sdk.getMnemonic();
      const seed = mnemonic.toSeed(secret, passphrase);

      const keys = this.sdkService.getSdk().getKeys();
      privateKey = keys.deriveFromSeed(seed, path).privateKey;
    }

    return privateKey;
  }

  public async queryAccountByAddress(
    address: string
  ): Promise<DerivedAccount | undefined> {
    return (await this.queryAllAccounts()).find(
      (account) => account.address === address
    );
  }

  private async findAllChildAccounts(
    accountId: string
  ): Promise<{ public: KeyStoreType; sensitive?: SensitiveType }[]> {
    return (
      (await this.vaultStorage.findAll(KeyStore, "parentId", accountId)) || []
    );
  }

  async renameAccount(
    topLevelAccountId: string,
    alias: string
  ): Promise<DerivedAccount> {
    const renameFn = (accountId: string): Promise<DerivedAccount> =>
      this.vaultStorage.update(KeyStore, "id", accountId, {
        alias,
      });

    const topLevelAccount = await renameFn(topLevelAccountId);

    const childAccounts = await this.findAllChildAccounts(topLevelAccountId);
    await Promise.all(
      childAccounts.map(async (account) => renameFn(account.public.id))
    );

    return topLevelAccount;
  }

  async deleteAccount(
    accountId: string
  ): Promise<Result<null, DeleteAccountError>> {
    const derivedAccounts = await this.findAllChildAccounts(accountId);

    const accountIds = [
      accountId,
      ...derivedAccounts.map((account) => account.public.id),
    ];

    for (const id of accountIds) {
      id && (await this.vaultStorage.remove(KeyStore, "id", id));
    }

    return Result.ok(null);
  }

  async sign(
    txProps: TxProps,
    signer: string,
    chainId: string
  ): Promise<Uint8Array> {
    await this.vaultService.assertIsUnlocked();
    const key = await this.getSigningKey(signer);
    const { signing } = this.sdkService.getSdk();
    return await signing.sign(txProps, key, chainId);
  }

  async signArbitrary(
    signer: string,
    data: string
  ): Promise<SignArbitraryResponse> {
    await this.vaultService.assertIsUnlocked();

    const key = await this.getSigningKey(signer);
    const sdk = this.sdkService.getSdk();
    const [hash, signature] = sdk.signing.signArbitrary(key, data);

    return { hash, signature };
  }

  async queryAccountDetails(
    address: string
  ): Promise<DerivedAccount | undefined> {
    const account = await this.vaultStorage.findOneOrFail(
      KeyStore,
      "address",
      address
    );
    if (!account) {
      return;
    }
    return account.public;
  }
}
