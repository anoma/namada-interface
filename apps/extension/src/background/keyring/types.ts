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

export type ScryptParams = KdfParams & {
  log_n: number;
  r: number;
  p: number;
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

export interface KeyStore<T = Argon2Params> {
  id: string;
  alias: string;
  address: string;
  owner: string;
  chainId: string;
  crypto: CryptoRecord<T>;
  meta?: {
    [key: string]: string;
  };
  path: Bip44Path;
  parentId?: string;
  type: AccountType;
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

export type UtilityStore = string | { [id: string]: CryptoRecord };

export enum ResetPasswordError {
  BadPassword,
  KeyStoreError,
}

export enum DeleteAccountError {
  BadPassword,
  KeyStoreError,
}
