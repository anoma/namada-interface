import { deserialize } from "@dao-xyz/borsh";

import { chains, defaultChainId } from "@namada/chains";
import {
  HDWallet,
  Mnemonic,
  PhraseSize,
  ShieldedHDWallet,
  VecU8Pointer,
  readStringPointer,
  readVecStringPointer,
} from "@namada/crypto";

import {
  Address,
  ExtendedSpendingKey,
  ExtendedViewingKey,
  PaymentAddress,
  Query,
  Sdk,
} from "@namada/shared";
import { KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  TransferMsgValue,
} from "@namada/types";

import {
  AccountStore,
  ActiveAccountStore,
  DeleteAccountError,
  KeyRingStatus,
  MnemonicValidationResponse,
  SensitiveAccountStoreData,
  UtilityStore,
  AccountSecret,
} from "./types";

import {
  Result,
  makeBip44PathArray,
  assertNever,
  truncateInMiddle,
} from "@namada/utils";

import { VaultService } from "background/vault";
import { generateId } from "utils";

const { REACT_APP_NAMADA_FAUCET_ADDRESS: faucetAddress } = process.env;

// Generated UUID namespace for uuid v5
const UUID_NAMESPACE = "9bfceade-37fe-11ed-acc0-a3da3461b38c";

export const KEYSTORE_KEY = "key-store";
export const SDK_KEY = "sdk-store";
export const PARENT_ACCOUNT_ID_KEY = "parent-account-id";
export const AUTHKEY_KEY = "auth-key-store";

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
  private _status: KeyRingStatus = KeyRingStatus.Empty;

  constructor(
    protected readonly vaultService: VaultService,
    protected readonly sdkStore: KVStore<Record<string, string>>,
    protected readonly utilityStore: KVStore<UtilityStore>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly sdk: Sdk,
    protected readonly query: Query,
    protected readonly cryptoMemory: WebAssembly.Memory
  ) { }

  public get status(): KeyRingStatus {
    return this._status;
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

  public validateMnemonic(phrase: string): MnemonicValidationResponse {
    const isValid = Mnemonic.validate(phrase);

    try {
      Mnemonic.from_phrase(phrase);
    } catch (e) {
      return { isValid, error: `${e}` };
    }

    return { isValid };
  }

  // Return new mnemonic to client for validation
  public async generateMnemonic(
    size: PhraseSize = PhraseSize.N12
  ): Promise<string[]> {
    const mnemonic = new Mnemonic(size);
    const vecStringPointer = mnemonic.to_words();
    const words = readVecStringPointer(vecStringPointer, this.cryptoMemory);

    mnemonic.free();
    vecStringPointer.free();

    return words;
  }

  public async storeLedger(
    alias: string,
    address: string,
    publicKey: string,
    bip44Path: Bip44Path,
    parentId?: string
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
      parentId,
    };
    await this.vaultService.add<AccountStore, SensitiveAccountStoreData>(
      KEYSTORE_KEY,
      accountStore,
      { text: "" }
    );

    // Prepare SDK store
    this.sdk.clear_storage();
    await this.initSdkStore(id);
    await this.setActiveAccount(parentId || id, AccountType.Ledger);
    return accountStore;
  }

  public async revealMnemonic(accountId: string): Promise<string> {
    const account = await this.vaultService.findOneOrFail<AccountStore>(
      KEYSTORE_KEY,
      "id",
      accountId
    );

    if (account.public.type !== AccountType.Mnemonic) {
      throw new Error("Account should have be created using a mnemonic test.");
    }

    const sensitiveData =
      await this.vaultService.reveal<SensitiveAccountStoreData>(account);

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

    const { sk, text, accountType } = ((): {
      sk: string;
      text: string;
      accountType: AccountType;
    } => {
      switch (accountSecret.t) {
        case "Mnemonic":
          const phrase = accountSecret.seedPhrase.join(" ");
          const mnemonic = Mnemonic.from_phrase(phrase);
          const seed = mnemonic.to_seed();
          const { coinType } = chains[defaultChainId].bip44;
          const bip44Path = makeBip44PathArray(coinType, path);
          const hdWallet = new HDWallet(seed);
          const key = hdWallet.derive(new Uint32Array(bip44Path));
          const privateKeyStringPtr = key.to_hex();
          const sk = readStringPointer(privateKeyStringPtr, this.cryptoMemory);

          mnemonic.free();
          hdWallet.free();
          key.free();
          privateKeyStringPtr.free();

          return { sk, text: phrase, accountType: AccountType.Mnemonic };

        case "PrivateKey":
          const { privateKey } = accountSecret;

          return {
            sk: privateKey,
            text: privateKey,
            accountType: AccountType.PrivateKey,
          };

        default:
          return assertNever(accountSecret);
      }
    })();

    const addr = new Address(sk);
    const address = addr.implicit();
    const publicKey = addr.public();

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
    const sensitiveData: SensitiveAccountStoreData = { text };
    await this.vaultService.add<AccountStore, SensitiveAccountStoreData>(
      KEYSTORE_KEY,
      accountStore,
      sensitiveData
    );

    // When we are adding new top level account we have to clear the storage
    // to prevent adding top level secret key to existing keys
    this.sdk.clear_storage();
    await this.addSecretKey(
      sk,
      await this.vaultService.UNSAFE_getPassword(),
      alias,
      id
    );
    await this.setActiveAccount(id, AccountType.Mnemonic);
    return accountStore;
  }

  public deriveTransparentAccount(
    seed: VecU8Pointer,
    path: Bip44Path,
    parentId: string
  ): DerivedAccountInfo {
    const { coinType } = chains[defaultChainId].bip44;
    const derivationPath = makeBip44PathArray(coinType, path);
    const hdWallet = new HDWallet(seed);
    const key = hdWallet.derive(new Uint32Array(derivationPath));
    const privateKey = key.to_hex();
    const text = readStringPointer(privateKey, this.cryptoMemory);
    const address = new Address(text).implicit();

    const { account, change, index } = path;
    const id = generateId(
      UUID_NAMESPACE,
      "account",
      parentId,
      account,
      change,
      index
    );

    hdWallet.free();
    key.free();
    privateKey.free();

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
    const { index } = path;
    const id = generateId(UUID_NAMESPACE, "shielded-account", parentId, index);
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

  // private async *getAddressWithBalance(
  //   seed: VecU8Pointer,
  //   parentId: string,
  //   type: AccountType
  // ): AsyncGenerator<
  //   {
  //     path: Bip44Path;
  //     info: DerivedAccountInfo;
  //   },
  //   void,
  //   void
  // > {
  //   let index = 0;
  //   let emptyBalanceCount = 0;
  //   const deriveFn = (
  //     type === AccountType.PrivateKey
  //       ? this.deriveTransparentAccount
  //       : this.deriveShieldedAccount
  //   ).bind(this);
  //
  //   const get = async (
  //     index: number
  //   ): Promise<{
  //     path: Bip44Path;
  //     info: DerivedAccountInfo;
  //     balances: [string, string][];
  //   }> => {
  //     // Cloning the seed, otherwise it gets zeroized in deriveTransparentAccount
  //     const seedClone = seed.clone();
  //     const path = { account: 0, change: 0, index };
  //     const accountInfo = deriveFn(seedClone, path, parentId);
  //     const balances: [string, string][] = await this.query.query_balance(
  //       accountInfo.owner
  //     );
  //
  //     return { path, info: accountInfo, balances };
  //   };
  //
  //   while (index < 999999999 && emptyBalanceCount < 20) {
  //     const { path, info, balances } = await get(index++);
  //     const hasBalance = balances.some(([, value]) => {
  //       return !new BigNumber(value).isZero();
  //     });
  //
  //     if (hasBalance) {
  //       emptyBalanceCount = 0;
  //       yield { path, info };
  //     } else {
  //       emptyBalanceCount++;
  //     }
  //   }
  // }

  public async scanAddresses(): Promise<void> {
    // if (!this._password) {
    //   throw new Error("No password is set!");
    // }
    // const { seed, parentId } = await this.getParentSeed(this._password);
    // for await (const value of this.getAddressWithBalance(
    //   seed,
    //   parentId,
    //   AccountType.PrivateKey
    // )) {
    //   const alias = `Address - ${value.path.index}`;
    //   const { info, path } = value;
    //   await this.persistAccount(
    //     this._password,
    //     path,
    //     parentId,
    //     AccountType.PrivateKey,
    //     alias,
    //     info
    //   );
    //   await this.addSecretKey(info.text, this._password, alias, parentId);
    // }
    // for await (const value of this.getAddressWithBalance(
    //   seed,
    //   parentId,
    //   AccountType.ShieldedKeys
    // )) {
    //   const alias = `Shielded Address - ${value.path.index}`;
    //   const { info, path } = value;
    //   await this.persistAccount(
    //     this._password,
    //     path,
    //     parentId,
    //     AccountType.ShieldedKeys,
    //     alias,
    //     info
    //   );
    //   await this.addSpendingKey(info.text, this._password, alias, parentId);
    // }
    // seed.free();
  }

  private async getParentSeed(): Promise<{
    parentId: string;
    seed: VecU8Pointer;
  }> {
    const activeAccount = await this.getActiveAccount();

    if (!activeAccount) {
      throw "No active account has been found";
    }

    const storedMnemonic = await this.vaultService.findOneOrFail<AccountStore>(
      KEYSTORE_KEY,
      "id",
      activeAccount.id
    );

    const parentId = storedMnemonic.public.id;
    try {
      const sensitiveData =
        await this.vaultService.reveal<SensitiveAccountStoreData>(
          storedMnemonic
        );

      if (!sensitiveData) {
        throw new Error(
          "Returned an empty value while decrypting mnemonic from password"
        );
      }

      const mnemonic = Mnemonic.from_phrase(sensitiveData.text);
      const seed = mnemonic.to_seed();
      mnemonic.free();
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
    this.vaultService.add<AccountStore, SensitiveAccountStoreData>(
      KEYSTORE_KEY,
      { ...account, owner },
      { text }
    );
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
      type === AccountType.PrivateKey
        ? this.deriveTransparentAccount
        : this.deriveShieldedAccount
    ).bind(this);

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

    const addSecretFn = (
      type === AccountType.PrivateKey ? this.addSecretKey : this.addSpendingKey
    ).bind(this);

    await addSecretFn(
      info.text,
      await this.vaultService.UNSAFE_getPassword(),
      alias,
      parentId
    );

    return derivedAccount;
  }

  public async queryAllAccounts(): Promise<DerivedAccount[]> {
    const accounts = await this.vaultService.findAll<AccountStore>(
      KEYSTORE_KEY
    );
    return accounts.map((entry) => entry.public as AccountStore);
  }

  /**
   * Query accounts from storage (active parent account + associated derived child accounts)
   */
  public async queryAccountById(accountId: string): Promise<DerivedAccount[]> {
    const parentAccount = await this.vaultService.findOne<AccountStore>(
      KEYSTORE_KEY,
      "id",
      accountId
    );

    const derivedAccounts =
      (await this.vaultService.findAll<AccountStore>(
        KEYSTORE_KEY,
        "parentId",
        accountId
      )) || [];

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

  public async queryAccountByPublicKey(
    publicKey: string
  ): Promise<DerivedAccount[]> {
    const parentAccount = await this.vaultService.findOne<AccountStore>(
      KEYSTORE_KEY,
      "publicKey",
      publicKey
    );

    const derivedAccounts =
      (await this.vaultService.findAll<AccountStore>(
        KEYSTORE_KEY,
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
      (await this.vaultService.findAll<AccountStore>(
        KEYSTORE_KEY,
        "type",
        AccountType.Mnemonic
      )) || [];
    return accounts.map((account) => account.public as AccountStore);
  }

  async submitBond(bondMsg: Uint8Array, txMsg: Uint8Array): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const builtTx = await this.sdk.build_bond(
        bondMsg,
        txMsg,
        await this.vaultService.UNSAFE_getPassword()
      );
      const [txBytes, revealPkTxBytes] = await this.sdk.sign_tx(builtTx, txMsg);
      await this.sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
    } catch (e) {
      throw new Error(`Could not submit bond tx: ${e}`);
    }
  }

  public async queryAccountByAddress(
    address: string
  ): Promise<DerivedAccount | undefined> {
    return (await this.queryAllAccounts()).find(
      (account) => account.address === address
    );
  }

  async submitUnbond(unbondMsg: Uint8Array, txMsg: Uint8Array): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const builtTx = await this.sdk.build_unbond(
        unbondMsg,
        txMsg,
        await this.vaultService.UNSAFE_getPassword()
      );
      const [txBytes, revealPkTxBytes] = await this.sdk.sign_tx(builtTx, txMsg);
      await this.sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
    } catch (e) {
      throw new Error(`Could not submit unbond tx: ${e}`);
    }
  }

  async submitWithdraw(
    withdrawMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const builtTx = await this.sdk.build_withdraw(
        withdrawMsg,
        txMsg,
        await this.vaultService.UNSAFE_getPassword()
      );
      const [txBytes, revealPkTxBytes] = await this.sdk.sign_tx(builtTx, txMsg);
      await this.sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
    } catch (e) {
      throw new Error(`Could not submit withdraw tx: ${e}`);
    }
  }

  async submitVoteProposal(
    voteProposalMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const builtTx = await this.sdk.build_vote_proposal(
        voteProposalMsg,
        txMsg,
        await this.vaultService.UNSAFE_getPassword()
      );
      const [txBytes, revealPkTxBytes] = await this.sdk.sign_tx(builtTx, txMsg);
      await this.sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
    } catch (e) {
      throw new Error(`Could not submit vote proposal tx: ${e}`);
    }
  }

  async submitTransfer(
    transferMsg: Uint8Array,
    submit: (password: string, xsk?: string) => Promise<void>
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();

    // We need to get the source address in case it is shielded one, so we can
    // decrypt the extended spending key for a transfer.
    const { source, target } = deserialize(
      Buffer.from(transferMsg),
      TransferMsgValue
    );

    const signerAddress = source === faucetAddress ? target : source;
    const account = await this.vaultService.findOneOrFail<AccountStore>(
      KEYSTORE_KEY,
      "address",
      signerAddress
    );
    const sensitiveProps =
      await this.vaultService.reveal<SensitiveAccountStoreData>(account);

    if (!sensitiveProps) {
      throw new Error("Error decrypting AccountStore data");
    }

    // For shielded accounts we need to return the spending key as well.
    // TODO: check if this .spendingKey is working
    const extendedSpendingKey =
      account.public.type === AccountType.ShieldedKeys
        ? JSON.parse(sensitiveProps.text).spendingKey
        : undefined;

    await submit(
      await this.vaultService.UNSAFE_getPassword(),
      extendedSpendingKey
    );
  }

  async submitIbcTransfer(
    ibcTransferMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const builtTx = await this.sdk.build_ibc_transfer(
        ibcTransferMsg,
        txMsg,
        await this.vaultService.UNSAFE_getPassword()
      );
      const [txBytes, revealPkTxBytes] = await this.sdk.sign_tx(builtTx, txMsg);
      await this.sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
    } catch (e) {
      throw new Error(`Could not submit ibc transfer tx: ${e}`);
    }
  }

  async submitEthBridgeTransfer(
    ethBridgeTransferMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const builtTx = await this.sdk.build_eth_bridge_transfer(
        ethBridgeTransferMsg,
        txMsg,
        await this.vaultService.UNSAFE_getPassword()
      );
      const [txBytes, revealPkTxBytes] = await this.sdk.sign_tx(builtTx, txMsg);
      await this.sdk.process_tx(txBytes, txMsg, revealPkTxBytes);
    } catch (e) {
      throw new Error(`Could not submit submit_eth_bridge_transfer tx: ${e}`);
    }
  }

  async renameAccount(
    accountId: string,
    alias: string
  ): Promise<DerivedAccount> {
    return await this.vaultService.update<DerivedAccount>(
      KEYSTORE_KEY,
      "id",
      accountId,
      {
        alias,
      }
    );
  }

  async deleteAccount(
    accountId: string
  ): Promise<Result<null, DeleteAccountError>> {
    const derivedAccounts =
      (await this.vaultService.findAll<AccountStore>(
        KEYSTORE_KEY,
        "parentId",
        accountId
      )) || [];

    const accountIds = [
      accountId,
      ...derivedAccounts.map((account) => account.public.id),
    ];

    for (const id of accountIds) {
      id &&
        (await this.vaultService.remove<AccountStore>(KEYSTORE_KEY, "id", id));
    }

    // remove account from sdk store
    const records = await this.sdkStore.get(SDK_KEY);
    if (records) {
      const updatedRecords = Object.keys(records).reduce((acc, recordId) => {
        if (accountIds.indexOf(recordId) >= 0) return acc;
        return {
          ...acc,
          [recordId]: records[recordId],
        };
      }, {});

      await this.sdkStore.set(SDK_KEY, updatedRecords);
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
