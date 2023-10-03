import { StoredRecord } from "@namada/storage";
import { AccountType, Bip44Path, DerivedAccount } from "@namada/types";

export enum KdfType {
  Argon2 = "argon2",
  Scrypt = "scrypt",
}

type KdfParams = {
  salt: string;
};

export type Argon2Params = KdfParams & {
  m_cost: number;
  t_cost: number;
  p_cost: number;
  salt: string;
};

export type CryptoRecord<T = Argon2Params> = {
  cipher: {
    type: "aes-256-gcm";
    iv: Uint8Array;
    text: Uint8Array;
  };
  kdf: {
    type: KdfType;
    params: T;
  };
};

export interface AccountStore extends StoredRecord {
  alias: string;
  address: string;
  owner: string;
  chainId: string;
  publicKey?: string;
  path: Bip44Path;
  parentId?: string;
  type: AccountType;
}

export interface KeyStore<T = Argon2Params> extends AccountStore {
  crypto: CryptoRecord<T>;
}

export type AccountState = DerivedAccount & {
  parentId: string;
  private: Uint8Array;
  public: Uint8Array;
};

export enum KeyRingStatus {
  NotLoaded,
  Empty,
  Locked,
  Unlocked,
}

export type TabStore = {
  tabId: number;
  timestamp: number;
};

export enum ResetPasswordError {
  BadPassword,
  KeyStoreError,
}

export type ParentAccount = AccountType.Mnemonic | AccountType.Ledger;

export type ActiveAccountStore = {
  id: string;
  type: ParentAccount;
};

export type DurablityStore = {
  isDurable: string;
};

export type UtilityStore = ActiveAccountStore | { [id: string]: CryptoRecord };

export type RevealedPKStore = { [id: string]: string };

export enum DeleteAccountError {
  BadPassword,
  KeyStoreError,
}
