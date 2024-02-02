import { deserialize } from "@dao-xyz/borsh";

import { chains } from "@namada/chains";
import {
  HDWallet,
  Mnemonic,
  PhraseSize,
  ShieldedHDWallet,
  StringPointer,
  VecU8Pointer,
  readStringPointer,
  readVecStringPointer,
} from "@namada/crypto";

import {
  Address,
  ExtendedSpendingKey,
  ExtendedViewingKey,
  PaymentAddress,
} from "@namada/shared";
import { KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  DerivedAccount,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SignatureResponse,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitVoteProposalMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
} from "@namada/types";
import {
  Result,
  assertNever,
  makeBip44PathArray,
  truncateInMiddle,
} from "@namada/utils";

import {
  AccountSecret,
  AccountStore,
  ActiveAccountStore,
  DeleteAccountError,
  KeyRingStatus,
  MnemonicValidationResponse,
  SensitiveAccountStoreData,
  SigningKey,
  UtilityStore,
} from "./types";

import { SdkService } from "background/sdk";
import { VaultService } from "background/vault";
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
    protected readonly sdkService: SdkService,
    protected readonly utilityStore: KVStore<UtilityStore>,
    protected readonly extensionStore: KVStore<number>,
    protected readonly cryptoMemory: WebAssembly.Memory
  ) {}

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
    await this.vaultService.add<AccountStore, SensitiveAccountStoreData>(
      KEYSTORE_KEY,
      accountStore,
      { text: "", passphrase: "" }
    );

    await this.setActiveAccount(id, AccountType.Ledger);
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

    const { sk, text, passphrase, accountType } = ((): {
      sk: string;
      text: string;
      passphrase: string;
      accountType: AccountType;
    } => {
      switch (accountSecret.t) {
        case "Mnemonic":
          const phrase = accountSecret.seedPhrase.join(" ");
          const mnemonic = Mnemonic.from_phrase(phrase);
          const passphrase = new StringPointer(accountSecret.passphrase);
          const seed = mnemonic.to_seed(passphrase);
          const { coinType } = chains.namada.bip44;
          const bip44Path = makeBip44PathArray(coinType, path);
          const hdWallet = new HDWallet(seed);
          const key = hdWallet.derive(new Uint32Array(bip44Path));
          const privateKeyStringPtr = key.to_hex();
          const sk = readStringPointer(privateKeyStringPtr, this.cryptoMemory);

          mnemonic.free();
          hdWallet.free();
          key.free();
          privateKeyStringPtr.free();

          return {
            sk,
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
    const sensitiveData: SensitiveAccountStoreData = { text, passphrase };
    await this.vaultService.add<AccountStore, SensitiveAccountStoreData>(
      KEYSTORE_KEY,
      accountStore,
      sensitiveData
    );
    await this.setActiveAccount(id, AccountType.Mnemonic);
    return accountStore;
  }

  public deriveTransparentAccount(
    seed: VecU8Pointer,
    path: Bip44Path,
    parentId: string
  ): DerivedAccountInfo {
    const { coinType } = chains.namada.bip44;
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
      text: JSON.stringify({ spendingKey }),
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

      const { text, passphrase } = sensitiveData;

      const mnemonic = Mnemonic.from_phrase(text);
      const passphrasePtr = passphrase
        ? new StringPointer(passphrase)
        : undefined;

      const seed = mnemonic.to_seed(passphrasePtr);
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
      { text, passphrase: "" }
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
    return derivedAccount;
  }

  public async queryAllAccounts(): Promise<DerivedAccount[]> {
    const accounts =
      await this.vaultService.findAll<AccountStore>(KEYSTORE_KEY);
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

  /**
   * For provided address, return associated private key
   */
  private async getSigningKey(address: string): Promise<string> {
    const account = await this.vaultService.findOne<AccountStore>(
      KEYSTORE_KEY,
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
    const { coinType } = chains.namada.bip44;
    const bip44Path = makeBip44PathArray(coinType, path);

    const sensitiveProps =
      await this.vaultService.reveal<SensitiveAccountStoreData>(account);
    if (!sensitiveProps) {
      throw new Error(`Signing key for ${address} not found!`);
    }
    const { text: secret, passphrase } = sensitiveProps;

    let privateKey: string;

    if (account.public.type === AccountType.PrivateKey) {
      privateKey = secret;
    } else {
      const mnemonic = Mnemonic.from_phrase(secret);
      const passphrasePtr =
        typeof passphrase === "string"
          ? new StringPointer(passphrase)
          : undefined;

      const seed = mnemonic.to_seed(passphrasePtr);
      const hdWallet = new HDWallet(seed);
      const key = hdWallet.derive(new Uint32Array(bip44Path));
      const privateKeyStringPtr = key.to_hex();
      privateKey = readStringPointer(privateKeyStringPtr, this.cryptoMemory);

      mnemonic.free();
      hdWallet.free();
      key.free();
      privateKeyStringPtr.free();
    }

    return privateKey;
  }

  async submitBond(bondMsg: Uint8Array, txMsg: Uint8Array): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    try {
      const { source } = deserialize(Buffer.from(bondMsg), SubmitBondMsgValue);
      const signingKey = await this.getSigningKey(source);
      const sdk = await this.sdkService.getSdk();
      await sdk.reveal_pk(signingKey, txMsg);

      const builtTx = await sdk.build_bond(bondMsg, txMsg);
      const txBytes = await sdk.sign_tx(builtTx, txMsg, signingKey);
      await sdk.process_tx(txBytes, txMsg);
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
    const sdk = await this.sdkService.getSdk();
    try {
      const { source } = deserialize(
        Buffer.from(unbondMsg),
        SubmitUnbondMsgValue
      );
      const signingKey = await this.getSigningKey(source);

      await sdk.reveal_pk(signingKey, txMsg);

      const builtTx = await sdk.build_unbond(unbondMsg, txMsg);
      const txBytes = await sdk.sign_tx(builtTx, txMsg, signingKey);
      await sdk.process_tx(txBytes, txMsg);
    } catch (e) {
      throw new Error(`Could not submit unbond tx: ${e}`);
    }
  }

  async submitWithdraw(
    withdrawMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    const sdk = await this.sdkService.getSdk();
    try {
      const { source } = deserialize(
        Buffer.from(withdrawMsg),
        SubmitWithdrawMsgValue
      );
      const signingKey = await this.getSigningKey(source);

      await sdk.reveal_pk(signingKey, txMsg);

      const builtTx = await sdk.build_withdraw(withdrawMsg, txMsg);
      const txBytes = await sdk.sign_tx(builtTx, txMsg, signingKey);
      await sdk.process_tx(txBytes, txMsg);
    } catch (e) {
      throw new Error(`Could not submit withdraw tx: ${e}`);
    }
  }

  async submitVoteProposal(
    voteProposalMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    const sdk = await this.sdkService.getSdk();
    try {
      const { signer } = deserialize(
        Buffer.from(voteProposalMsg),
        SubmitVoteProposalMsgValue
      );
      const signingKey = await this.getSigningKey(signer);

      await sdk.reveal_pk(signingKey, txMsg);

      const builtTx = await sdk.build_vote_proposal(voteProposalMsg, txMsg);

      const txBytes = await sdk.sign_tx(builtTx, txMsg, signingKey);
      await sdk.process_tx(txBytes, txMsg);
    } catch (e) {
      throw new Error(`Could not submit vote proposal tx: ${e}`);
    }
  }

  async submitTransfer(
    transferMsg: Uint8Array,
    submit: (signingKey: SigningKey) => Promise<void>
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();

    // We need to get the source address to find either the private key or spending key
    const { source } = deserialize(Buffer.from(transferMsg), TransferMsgValue);

    const account = await this.vaultService.findOneOrFail<AccountStore>(
      KEYSTORE_KEY,
      "address",
      source
    );
    const sensitiveProps =
      await this.vaultService.reveal<SensitiveAccountStoreData>(account);

    if (!sensitiveProps) {
      throw new Error("Error decrypting AccountStore data");
    }

    if (account.public.type === AccountType.ShieldedKeys) {
      const xsk = JSON.parse(sensitiveProps.text).spendingKey;

      await submit({
        xsk,
      });
    } else {
      await submit({ privateKey: await this.getSigningKey(source) });
    }
  }

  async submitIbcTransfer(
    ibcTransferMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    const sdk = await this.sdkService.getSdk();
    try {
      const { source } = deserialize(
        Buffer.from(ibcTransferMsg),
        IbcTransferMsgValue
      );
      const signingKey = await this.getSigningKey(source);

      await sdk.reveal_pk(signingKey, txMsg);

      const builtTx = await sdk.build_ibc_transfer(ibcTransferMsg, txMsg);
      const txBytes = await sdk.sign_tx(builtTx, txMsg, signingKey);
      await sdk.process_tx(txBytes, txMsg);
    } catch (e) {
      throw new Error(`Could not submit ibc transfer tx: ${e}`);
    }
  }

  async submitEthBridgeTransfer(
    ethBridgeTransferMsg: Uint8Array,
    txMsg: Uint8Array
  ): Promise<void> {
    await this.vaultService.assertIsUnlocked();
    const sdk = await this.sdkService.getSdk();
    try {
      const { sender } = deserialize(
        Buffer.from(ethBridgeTransferMsg),
        EthBridgeTransferMsgValue
      );
      const signingKey = await this.getSigningKey(sender);

      await sdk.reveal_pk(signingKey, txMsg);

      const builtTx = await sdk.build_eth_bridge_transfer(
        ethBridgeTransferMsg,
        txMsg
      );
      const txBytes = await sdk.sign_tx(builtTx, txMsg, signingKey);
      await sdk.process_tx(txBytes, txMsg);
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

    return Result.ok(null);
  }

  async queryBalances(
    owner: string,
    tokens: string[]
  ): Promise<{ token: string; amount: string }[]> {
    const query = await this.sdkService.getQuery();

    try {
      return (await query.query_balance(owner, tokens)).map(
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

  async queryPublicKey(address: string): Promise<string | undefined> {
    const query = await this.sdkService.getQuery();
    return await query.query_public_key(address);
  }

  async signArbitrary(
    signer: string,
    data: string
  ): Promise<SignatureResponse> {
    await this.vaultService.assertIsUnlocked();

    const key = await this.getSigningKey(signer);
    const sdk = await this.sdkService.getSdk();
    const [hash, signature] = sdk.sign_arbitrary(key, data);

    return { hash, signature };
  }
}
