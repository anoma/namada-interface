import BigNumber from "bignumber.js";
import { v4 as uuidV4 } from "uuid";
import { deserialize } from "borsh";

import { chains } from "@anoma/chains";
import {
  HDWallet,
  Mnemonic,
  PhraseSize,
  ShieldedHDWallet,
  VecU8Pointer,
} from "@anoma/crypto";
import {
  Account,
  Address,
  ExtendedSpendingKey,
  ExtendedViewingKey,
  PaymentAddress,
  Sdk,
  Query,
} from "@anoma/shared";
import { IStore, KVStore, Store } from "@anoma/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  SubmitTransferMsgSchema,
  TransferMsgValue,
} from "@anoma/types";
import {
  ActiveAccountStore,
  KeyRingStatus,
  KeyStore,
  ResetPasswordError,
  DeleteAccountError,
  CryptoRecord,
  UtilityStore,
} from "./types";
import {
  readVecStringPointer,
  readStringPointer,
} from "@anoma/crypto/src/utils";
import { makeBip44Path, Result } from "@anoma/utils";

import { Crypto } from "./crypto";
import { getAccountValuesFromStore, generateId } from "utils";

// Generated UUID namespace for uuid v5
const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

export const KEYSTORE_KEY = "key-store";
export const SDK_KEY = "sdk-store";
export const PARENT_ACCOUNT_ID_KEY = "parent-account-id";
export const AUTHKEY_KEY = "auth-key-store";

const crypto = new Crypto();

type DerivedAccountInfo = {
  address: string;
  id: string;
  text: string;
  owner: string;
};

/**
 * Keyring stores keys in persisted backround.
 */
export class KeyRing {
  private _keyStore: IStore<KeyStore>;
  private _password: string | undefined;
  private _status: KeyRingStatus = KeyRingStatus.Empty;
  private _cryptoMemory: WebAssembly.Memory;

  constructor(
    protected readonly kvStore: KVStore<KeyStore[]>,
    protected readonly sdkStore: KVStore<Record<string, string>>,
    protected readonly utilityStore: KVStore<UtilityStore>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly chainId: string,
    protected readonly sdk: Sdk,
    protected readonly query: Query,
    protected readonly cryptoMemory: WebAssembly.Memory
  ) {
    this._keyStore = new Store(KEYSTORE_KEY, kvStore);
    this._cryptoMemory = cryptoMemory;
  }

  public isLocked(): boolean {
    return this._password === undefined;
  }

  public get status(): KeyRingStatus {
    return this._status;
  }

  public async lock(): Promise<void> {
    this._status = KeyRingStatus.Locked;
    this._password = undefined;
  }

  public async unlock(password: string): Promise<void> {
    if (await this.checkPassword(password)) {
      this._password = password;
      this._status = KeyRingStatus.Unlocked;
    }
  }

  public async getActiveAccount(): Promise<ActiveAccountStore | undefined> {
    return await this.utilityStore.get(PARENT_ACCOUNT_ID_KEY);
  }

  public async setActiveAccount(
    id: string,
    type: AccountType.Mnemonic | AccountType.Ledger
  ): Promise<void> {
    await this.utilityStore.set(PARENT_ACCOUNT_ID_KEY, { id, type });
    // To sync sdk wallet with DB
    const sdkData = await this.sdkStore.get(SDK_KEY);
    if (sdkData) {
      this.sdk.decode(new TextEncoder().encode(sdkData[id]));
    }
  }

  public async checkPassword(
    password: string,
    accountId?: string
  ): Promise<boolean> {
    // default to active account if no account provided
    const idToCheck = accountId ?? (await this.getActiveAccount())?.id;
    if (!idToCheck) {
      throw new Error("No account to check password against");
    }

    const authKeys = await this.utilityStore.get<{
      [id: string]: CryptoRecord;
    }>(AUTHKEY_KEY);
    if (authKeys) {
      try {
        crypto.decrypt(authKeys[idToCheck], password, this._cryptoMemory);
        return true;
      } catch (error) {
        console.warn(error);
      }
    }

    return false;
  }

  // Reset password by re-encrypting secrets with new password
  public async resetPassword(
    currentPassword: string,
    newPassword: string,
    accountId: string
  ): Promise<Result<null, ResetPasswordError>> {
    const passwordOk = await this.checkPassword(currentPassword, accountId);

    if (!passwordOk) {
      return Result.err(ResetPasswordError.BadPassword);
    }

    const topLevelAccount = await this._keyStore.getRecord("id", accountId);

    const derivedAccounts =
      (await this._keyStore.getRecords("parentId", accountId)) || [];

    if (topLevelAccount) {
      try {
        const allAccounts = [topLevelAccount, ...derivedAccounts];

        for (const account of allAccounts) {
          const decryptedSecret = crypto.decrypt(
            account.crypto,
            currentPassword,
            this._cryptoMemory
          );
          const reencrypted = crypto.encrypt({
            ...account,
            password: newPassword,
            text: decryptedSecret,
          });
          await this._keyStore.update(account.id, reencrypted);
        }

        // change password held locally if active account password changed
        if (accountId === (await this.getActiveAccount())?.id) {
          this._password = newPassword;
        }
      } catch (error) {
        console.warn(error);
        return Result.err(ResetPasswordError.KeyStoreError);
      }
    } else {
      return Result.err(ResetPasswordError.KeyStoreError);
    }

    return Result.ok(null);
  }

  public validateMnemonic(phrase: string): boolean {
    return Mnemonic.validate(phrase);
  }

  // Return new mnemonic to client for validation
  public async generateMnemonic(
    size: PhraseSize = PhraseSize.N12
  ): Promise<string[]> {
    const mnemonic = new Mnemonic(size);
    const vecStringPointer = mnemonic.to_words();
    const words = readVecStringPointer(vecStringPointer, this._cryptoMemory);

    mnemonic.free();
    vecStringPointer.free();

    return words;
  }

  // Store validated mnemonic
  public async storeMnemonic(
    mnemonic: string[],
    password: string,
    alias: string
  ): Promise<boolean> {
    if (!password) {
      throw new Error("Password is not provided! Cannot store mnemonic");
    }
    const phrase = mnemonic.join(" ");

    try {
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();
      const { coinType } = chains[this.chainId].bip44;
      const path = { account: 0, change: 0 };
      const bip44Path = makeBip44Path(coinType, path);
      const hdWallet = new HDWallet(seed);
      const account = hdWallet.derive(bip44Path);
      const stringPointer = account.private().to_hex();
      const sk = readStringPointer(stringPointer, this._cryptoMemory);
      const address = new Address(sk).implicit();
      const { chainId } = this;

      // Generate unique ID for new parent account:
      const id = generateId(
        UUID_NAMESPACE,
        phrase,
        (await this._keyStore.get()).length
      );

      mnemonic.free();
      hdWallet.free();
      account.free();
      stringPointer.free();

      const mnemonicStore = crypto.encrypt({
        id,
        alias,
        address,
        owner: address,
        chainId,
        password,
        path,
        text: phrase,
        type: AccountType.Mnemonic,
      });

      await this._keyStore.append(mnemonicStore);
      await this.generateAuthKey(id, password);
      // When we are adding new top level account we have to clear the storage
      // to prevent adding top level secret key to existing keys
      this.sdk.clear_storage();
      await this.addSecretKey(sk, password, alias, id);
      await this.setActiveAccount(id, AccountType.Mnemonic);

      this._password = password;
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public async generateAuthKey(
    accountId: string,
    password: string
  ): Promise<void> {
    const id = uuidV4();
    const authKey = crypto.encryptAuthKey(password, id);
    const entries = await this.utilityStore.get<{ [id: string]: CryptoRecord }>(
      AUTHKEY_KEY
    );
    await this.utilityStore.set(AUTHKEY_KEY, {
      ...entries,
      [accountId]: authKey,
    });
  }

  public deriveTransparentAccount(
    seed: VecU8Pointer,
    path: Bip44Path,
    parentId: string
  ): DerivedAccountInfo {
    const { coinType } = chains[this.chainId].bip44;
    const derivationPath = makeBip44Path(coinType, path);
    const hdWallet = new HDWallet(seed);
    const derivedAccount = hdWallet.derive(derivationPath);
    const privateKey = derivedAccount.private();
    const hex = privateKey.to_hex();
    const text = readStringPointer(hex, this.cryptoMemory);
    const address = new Address(text).implicit();

    const { account, change, index = 0 } = path;
    const id = generateId(
      UUID_NAMESPACE,
      "account",
      parentId,
      account,
      change,
      index
    );

    hdWallet.free();
    derivedAccount.free();
    privateKey.free();
    hex.free();

    return {
      address,
      owner: address,
      id,
      text,
    };
  }

  public deriveShieldedAccount(
    seed: VecU8Pointer,
    path: Bip44Path,
    parentId: string
  ): DerivedAccountInfo {
    const { index = 0 } = path;
    const id = generateId("shielded-account", parentId, index);
    const zip32 = new ShieldedHDWallet(seed);
    const account = zip32.derive_to_serialized_keys(index);

    // Retrieve serialized types from wasm
    const xsk = account.xsk();
    const xfvk = account.xfvk();
    const payment_address = account.payment_address();

    // Deserialize and encode keys and address
    const extendedSpendingKey = new ExtendedSpendingKey(xsk);
    const extendedViewingKey = new ExtendedViewingKey(xfvk);
    const address = new PaymentAddress(payment_address).encode();
    const spendingKey = extendedSpendingKey.encode();
    const viewingKey = extendedViewingKey.encode();

    zip32.free();
    account.free();
    extendedViewingKey.free();
    extendedSpendingKey.free();

    return {
      address,
      id,
      owner: viewingKey,
      text: JSON.stringify({ spendingKey, viewingKey }),
    };
  }

  private async *getAddressWithBalance(
    seed: VecU8Pointer,
    parentId: string,
    type: AccountType
  ): AsyncGenerator<
    {
      path: Bip44Path;
      info: DerivedAccountInfo;
    },
    void,
    void
  > {
    let index = 0;
    let emptyBalanceCount = 0;
    const deriveFn = (
      type === AccountType.PrivateKey
        ? this.deriveTransparentAccount
        : this.deriveShieldedAccount
    ).bind(this);

    const get = async (
      index: number
    ): Promise<{
      path: Bip44Path;
      info: DerivedAccountInfo;
      balances: [string, string][];
    }> => {
      // Cloning the seed, otherwise it gets zeroized in deriveTransparentAccount
      const seedClone = seed.clone();
      const path = { account: 0, change: 0, index };
      const accountInfo = deriveFn(seedClone, path, parentId);
      const balances: [string, string][] = await this.query.query_balance(
        accountInfo.owner
      );

      return { path, info: accountInfo, balances };
    };

    while (index < 999999999 && emptyBalanceCount < 20) {
      const { path, info, balances } = await get(index++);
      const hasBalance = balances.some(([, value]) => {
        return !new BigNumber(value).isZero();
      });

      if (hasBalance) {
        emptyBalanceCount = 0;
        yield { path, info };
      } else {
        emptyBalanceCount++;
      }
    }
  }

  public async scanAddresses(): Promise<void> {
    if (!this._password) {
      throw new Error("No password is set!");
    }

    const { seed, parentId } = await this.getParentSeed(this._password);

    for await (const value of this.getAddressWithBalance(
      seed,
      parentId,
      AccountType.PrivateKey
    )) {
      const alias = `Address - ${value.path.index}`;
      const { info, path } = value;
      await this.persistAccount(
        this._password,
        path,
        parentId,
        AccountType.PrivateKey,
        alias,
        info
      );
      await this.addSecretKey(info.text, this._password, alias, parentId);
    }

    for await (const value of this.getAddressWithBalance(
      seed,
      parentId,
      AccountType.ShieldedKeys
    )) {
      const alias = `Shielded Address - ${value.path.index}`;
      const { info, path } = value;
      await this.persistAccount(
        this._password,
        path,
        parentId,
        AccountType.ShieldedKeys,
        alias,
        info
      );
      await this.addSpendingKey(info.text, this._password, alias, parentId);
    }

    seed.free();
  }

  private async getParentSeed(password: string): Promise<{
    parentId: string;
    seed: VecU8Pointer;
  }> {
    const activeAccount = await this.getActiveAccount();
    const storedMnemonic = await this._keyStore.getRecord(
      "id",
      activeAccount?.id
    );

    if (!storedMnemonic) {
      throw new Error("Mnemonic is not set!");
    }

    const parentId = storedMnemonic.id;
    try {
      const phrase = crypto.decrypt(
        storedMnemonic.crypto,
        password,
        this._cryptoMemory
      );
      const mnemonic = Mnemonic.from_phrase(phrase);
      const seed = mnemonic.to_seed();
      mnemonic.free();
      return { parentId, seed };
    } catch (e) {
      throw Error("Could not decrypt mnemonic from password");
    }
  }

  private async persistAccount(
    password: string,
    path: Bip44Path,
    parentId: string,
    type: AccountType,
    alias: string,
    derivedAccountInfo: DerivedAccountInfo
  ): Promise<DerivedAccount> {
    const { address, id, text, owner } = derivedAccountInfo;

    this._keyStore.append(
      crypto.encrypt({
        alias,
        address,
        owner,
        chainId: this.chainId,
        id,
        parentId,
        password,
        path,
        text,
        type,
      })
    );

    return {
      id,
      address,
      alias,
      chainId: this.chainId,
      parentId,
      path,
      type,
    };
  }

  public async deriveAccount(
    path: Bip44Path,
    type: AccountType,
    alias: string
  ): Promise<DerivedAccount> {
    if (!this._password) {
      throw new Error("No password is set!");
    }
    if (type !== AccountType.PrivateKey && type !== AccountType.ShieldedKeys) {
      throw new Error("Unsupported account type");
    }
    const deriveFn = (
      type === AccountType.PrivateKey
        ? this.deriveTransparentAccount
        : this.deriveShieldedAccount
    ).bind(this);

    const { seed, parentId } = await this.getParentSeed(this._password);
    const info = deriveFn(seed, path, parentId);
    const derivedAccount = await this.persistAccount(
      this._password,
      path,
      parentId,
      type,
      alias,
      info
    );

    const addSecretFn = (
      type === AccountType.PrivateKey ? this.addSecretKey : this.addSpendingKey
    ).bind(this);
    await addSecretFn(info.text, this._password, alias, parentId);

    return derivedAccount;
  }

  /**
   * Query accounts from storage (active parent account + associated derived child accounts)
   */
  public async queryAccounts(
    activeAccountId: string
  ): Promise<DerivedAccount[]> {
    const parentAccount = await this._keyStore.getRecord("id", activeAccountId);

    const derivedAccounts =
      (await this._keyStore.getRecords("parentId", activeAccountId)) || [];

    if (parentAccount) {
      const accounts = [parentAccount, ...derivedAccounts];

      return getAccountValuesFromStore(accounts);
    }
    return [];
  }

  /**
   * Query all top-level parent accounts (mnemonic accounts)
   */
  public async queryParentAccounts(): Promise<DerivedAccount[]> {
    const accounts =
      (await this._keyStore.getRecords("type", AccountType.Mnemonic)) || [];
    // Return only non-encrypted data
    return getAccountValuesFromStore(accounts);
  }

  async encodeInitAccount(
    address: string,
    txMsg: Uint8Array
  ): Promise<Uint8Array> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }
    const account = await this._keyStore.getRecord("address", address);
    if (!account) {
      throw new Error(`Account not found for ${address}`);
    }

    let pk: string;

    try {
      pk = crypto.decrypt(account.crypto, this._password, this._cryptoMemory);
    } catch (e) {
      throw new Error(`Could not unlock account for ${address}: ${e}`);
    }

    try {
      const { tx_data } = new Account(txMsg, pk).to_serialized();
      return tx_data;
    } catch (e) {
      throw new Error(`Could not encode InitAccount for ${address}: ${e}`);
    }
  }

  async submitBond(txMsg: Uint8Array): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    try {
      await this.sdk.submit_bond(txMsg, this._password);
    } catch (e) {
      throw new Error(`Could not submit bond tx: ${e}`);
    }
  }

  async submitUnbond(txMsg: Uint8Array): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    try {
      await this.sdk.submit_unbond(txMsg, this._password);
    } catch (e) {
      throw new Error(`Could not submit unbond tx: ${e}`);
    }
  }

  async submitTransfer(
    txMsg: Uint8Array,
    submit: (password: string, xsk?: string) => Promise<void>
  ): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    // We need to get the source address in case it is shielded one, so we can
    // decrypt the extended spending key for a transfer.
    const { source } = deserialize(
      SubmitTransferMsgSchema,
      TransferMsgValue,
      Buffer.from(txMsg)
    );

    const account = await this._keyStore.getRecord("address", source);
    if (!account) {
      throw new Error(`Account not found.`);
    }
    const text = crypto.decrypt(
      account.crypto,
      this._password,
      this._cryptoMemory
    );

    // For shielded accounts we need to return the spending key as well.
    const extendedSpendingKey =
      account.type === AccountType.ShieldedKeys
        ? JSON.parse(text).spendingKey
        : undefined;

    await submit(this._password, extendedSpendingKey);
  }

  async submitIbcTransfer(txMsg: Uint8Array): Promise<void> {
    if (!this._password) {
      throw new Error("Not authenticated!");
    }

    try {
      await this.sdk.submit_ibc_transfer(txMsg, this._password);
    } catch (e) {
      throw new Error(`Could not submit ibc transfer tx: ${e}`);
    }
  }

  async deleteAccount(
    accountId: string,
    password: string
  ): Promise<Result<null, DeleteAccountError>> {
    const passwordOk = await this.checkPassword(password, accountId);

    if (!passwordOk) {
      return Result.err(DeleteAccountError.BadPassword);
    }

    const derivedAccounts =
      (await this._keyStore.getRecords("parentId", accountId)) || [];

    const accountIds = [accountId, ...derivedAccounts.map(({ id }) => id)];

    for (const id of accountIds) {
      id && (await this._keyStore.remove(id));
    }

    // remove password held locally if active account deleted
    if (accountId === (await this.getActiveAccount())?.id) {
      this._password = undefined;
    }

    // remove account from sdk store
    const records = await this.sdkStore.get(SDK_KEY);
    if (records) {
      const { [accountId]: _, ...rest } = records;
      await this.sdkStore.set(SDK_KEY, rest);
    }

    return Result.ok(null);
  }

  async queryBalances(
    owner: string
  ): Promise<{ token: string; amount: string }[]> {
    try {
      return (await this.query.query_balance(owner)).map(
        ([token, amount]: [string, string]) => {
          return {
            token,
            amount,
          };
        }
      );
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  private async addSecretKey(
    secretKey: string,
    password: string,
    alias: string,
    activeAccountId: string
  ): Promise<void> {
    this.sdk.add_key(secretKey, password, alias);
    await this.initSdkStore(activeAccountId);
  }

  public async initSdkStore(activeAccountId: string): Promise<void> {
    const store = (await this.sdkStore.get(SDK_KEY)) || {};

    this.sdkStore.set(SDK_KEY, {
      ...store,
      [activeAccountId]: new TextDecoder().decode(this.sdk.encode()),
    });
  }

  private async addSpendingKey(
    text: string,
    password: string,
    alias: string,
    activeAccountId: string
  ): Promise<void> {
    const { spendingKey } = JSON.parse(text);

    this.sdk.add_spending_key(spendingKey, password, alias);
    const store = (await this.sdkStore.get(SDK_KEY)) || {};

    //TODO: reuse logic from addSecretKey, potentially use Object.assign instead of rest spread operator
    this.sdkStore.set(SDK_KEY, {
      ...store,
      [activeAccountId]: new TextDecoder().decode(this.sdk.encode()),
    });
  }
}
