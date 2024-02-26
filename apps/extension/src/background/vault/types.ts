export enum ResetPasswordError {
  BadPassword,
  KeyStoreError,
}

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

export type Vault<T = unknown> = {
  public: T;
  sensitive?: CryptoRecord;
};

export type VaultStoreData = Record<string, Vault[]>;

export type SessionPassword = string;
