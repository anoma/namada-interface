import { CryptoRecord } from "@heliaxdev/namada-sdk/web";

export enum ResetPasswordError {
  BadPassword,
  KeyStoreError,
}

export type Vault<T = unknown> = {
  public: T;
  sensitive?: CryptoRecord;
};

export type VaultStoreData = Record<string, Vault[]>;

export type SessionPassword = string;
