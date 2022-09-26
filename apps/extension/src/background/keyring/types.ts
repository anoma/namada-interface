export type Bip44Path = {
  account: number;
  change: number;
  index: number;
};

export type MnemonicState = {
  id: string;
  description?: string;
  phrase: Uint8Array;
};

export type DerivedAccount = {
  bip44Path: Bip44Path;
  address: string;
  establishedAddress?: string;
  description?: string;
};

export type AccountState = DerivedAccount & {
  id: string;
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
