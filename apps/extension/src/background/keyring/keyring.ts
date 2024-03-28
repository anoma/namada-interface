import { deserialize } from "@dao-xyz/borsh";

import { KVStore } from "@namada/storage";
import {
  AccountType,
  Bip44Path,
  BondMsgValue,
  DerivedAccount,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SignatureResponse,
  TransferMsgValue,
  TxMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
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
  SigningKey,
  UtilityStore,
} from "./types";

import { PhraseSize } from "@namada/sdk/web";
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
    type: AccountType.Mnemonic | AccountType.Ledger
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

  async submitBond(bondMsg: BondMsgValue, txMsg: TxMsgValue): Promise<string> {
    await this.vaultService.assertIsUnlocked();
    try {
      const { source } = bondMsg;
      const signingKey = await this.getSigningKey(source);
      const sdk = this.sdkService.getSdk();
      const sdkTx = sdk.tx;

      await sdkTx.revealPk(signingKey, txMsg);

      const builtTx = await sdkTx.buildBond(txMsg, bondMsg);
      const signedTx = await sdkTx.signTx(builtTx, signingKey);
      const innerTxHash: string = await sdk.rpc.broadcastTx(signedTx);

      return innerTxHash;
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

  async submitUnbond(
    unbondMsg: UnbondMsgValue,
    txMsg: TxMsgValue
  ): Promise<string> {
    await this.vaultService.assertIsUnlocked();
    const sdk = this.sdkService.getSdk();
    try {
      const { source } = unbondMsg;
      const signingKey = await this.getSigningKey(source);

      await sdk.tx.revealPk(signingKey, txMsg);

      const builtTx = await sdk.tx.buildUnbond(txMsg, unbondMsg);
      const signedTx = await sdk.tx.signTx(builtTx, signingKey);
      const innerTxHash: string = await sdk.rpc.broadcastTx(signedTx);

      return innerTxHash;
    } catch (e) {
      throw new Error(`Could not submit unbond tx: ${e}`);
    }
  }

  async submitWithdraw(
    withdrawMsg: WithdrawMsgValue,
    txMsg: TxMsgValue
  ): Promise<string> {
    await this.vaultService.assertIsUnlocked();
    const sdk = this.sdkService.getSdk();
    try {
      const { source } = withdrawMsg;
      const signingKey = await this.getSigningKey(source);

      await sdk.tx.revealPk(signingKey, txMsg);

      const builtTx = await sdk.tx.buildWithdraw(txMsg, withdrawMsg);
      const signedTx = await sdk.tx.signTx(builtTx, signingKey);
      const innerTxHash: string = await sdk.rpc.broadcastTx(signedTx);

      return innerTxHash;
    } catch (e) {
      throw new Error(`Could not submit withdraw tx: ${e}`);
    }
  }

  async submitVoteProposal(
    voteProposalMsg: VoteProposalMsgValue,
    txMsg: TxMsgValue
  ): Promise<string> {
    await this.vaultService.assertIsUnlocked();
    const sdk = this.sdkService.getSdk();
    try {
      const { signer } = voteProposalMsg;
      const signingKey = await this.getSigningKey(signer);

      await sdk.tx.revealPk(signingKey, txMsg);

      const builtTx = await sdk.tx.buildVoteProposal(txMsg, voteProposalMsg);
      const signedTx = await sdk.tx.signTx(builtTx, signingKey);
      await sdk.rpc.broadcastTx(signedTx);
      const innerTxHash: string = await sdk.rpc.broadcastTx(signedTx);

      return innerTxHash;
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

    const account = await this.vaultStorage.findOneOrFail(
      KeyStore,
      "address",
      source
    );
    const sensitiveProps =
      await this.vaultService.reveal<SensitiveAccountStoreData>(
        account.sensitive
      );

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
    ibcTransferMsg: IbcTransferMsgValue,
    txMsg: TxMsgValue
  ): Promise<string> {
    await this.vaultService.assertIsUnlocked();
    const sdk = this.sdkService.getSdk();
    try {
      const { source } = ibcTransferMsg;
      const signingKey = await this.getSigningKey(source);

      await sdk.tx.revealPk(signingKey, txMsg);

      const builtTx = await sdk.tx.buildIbcTransfer(txMsg, ibcTransferMsg);
      const signedTx = await sdk.tx.signTx(builtTx, signingKey);
      const innerTxHash: string = await sdk.rpc.broadcastTx(signedTx);

      return innerTxHash;
    } catch (e) {
      throw new Error(`Could not submit ibc transfer tx: ${e}`);
    }
  }

  async submitEthBridgeTransfer(
    ethBridgeTransferMsg: EthBridgeTransferMsgValue,
    txMsg: TxMsgValue
  ): Promise<string> {
    await this.vaultService.assertIsUnlocked();
    const sdk = this.sdkService.getSdk();
    try {
      const { sender } = ethBridgeTransferMsg;
      const signingKey = await this.getSigningKey(sender);

      await sdk.tx.revealPk(signingKey, txMsg);

      const builtTx = await sdk.tx.buildEthBridgeTransfer(
        txMsg,
        ethBridgeTransferMsg
      );
      const signedTx = await sdk.tx.signTx(builtTx, signingKey);
      const innerTxHash: string = await sdk.rpc.broadcastTx(signedTx);

      return innerTxHash;
    } catch (e) {
      throw new Error(`Could not submit submit_eth_bridge_transfer tx: ${e}`);
    }
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

  async queryBalances(
    owner: string,
    tokens: string[]
  ): Promise<{ token: string; amount: string }[]> {
    const query = this.sdkService.getSdk().rpc;

    try {
      return (await query.queryBalance(owner, tokens)).map(
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
    const query = this.sdkService.getSdk().rpc;
    return await query.queryPublicKey(address);
  }

  async signArbitrary(
    signer: string,
    data: string
  ): Promise<SignatureResponse> {
    await this.vaultService.assertIsUnlocked();

    const key = await this.getSigningKey(signer);
    const sdk = this.sdkService.getSdk();
    const [hash, signature] = sdk.signing.signArbitrary(key, data);

    return { hash, signature };
  }
}
