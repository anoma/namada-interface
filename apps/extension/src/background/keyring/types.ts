import { AccountType, Bip44Path, DerivedAccount } from "@anoma/types";

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
};

export type ScryptParams = KdfParams & {
  log_n: number;
  r: number;
  p: number;
};

export interface KeyStore<T = Argon2Params> {
  id: string;
  alias: string;
  address: string;
  xvk: string;
  chainId: string;
  crypto: {
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

export enum ResetPasswordError {
  BadPassword,
  KeyStoreError
};

export enum DeleteAccountError {
  BadPassword,
  KeyStoreError
};
