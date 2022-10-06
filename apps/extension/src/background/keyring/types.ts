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
  NotLoaded,
  Empty,
  Locked,
  Unlocked,
}
