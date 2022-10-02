export type Bip44Path = {
  account: number;
  change: number;
  index: number;
};

export enum KdfTypes {
  Argon2 = "argon2",
  Scrypt = "scrypt",
}

export type Argon2Params = {
  m_cost: number;
  t_cost: number;
  p_cost: number;
};

export type ScryptParams = {
  log_n: number;
  r: number;
  p: number;
};

export interface KeyStore {
  id: string;
  alias: string;
  path: Bip44Path;
  parentId?: string;
  meta?: {
    [key: string]: string;
  };
  crypto: {
    cipher: "aes-256-gcm";
    cipherParams: {
      iv: Uint8Array;
    };
    cipherText: Uint8Array;
    kdf: KdfTypes;
    params: Argon2Params;
    salt: string;
  };
}

export type CounterState = number;

export type MnemonicState = {
  id: string;
  alias?: string;
  phrase: Uint8Array;
};

export type DerivedAccount = {
  id: string;
  address: string;
  alias?: string;
  bip44Path: Bip44Path;
  establishedAddress?: string;
};

export type AccountState = DerivedAccount & {
  parentId: string;
  private: Uint8Array;
  public: Uint8Array;
};

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}
