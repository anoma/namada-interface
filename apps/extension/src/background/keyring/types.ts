import { ScryptParams, Argon2Params } from "@anoma/crypto";

export type Bip44Path = {
  account: number;
  change: number;
  index: number;
};

export type MnemonicState = {
  id: string;
  alias?: string;
  phrase: Uint8Array;
};

export type Storage = {
  kdf: "scrypt" | "argon2";
  params: ScryptParams | Argon2Params;
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
