export type Bip44Path = {
  account: number;
  change: number;
  index?: number;
};

export enum AccountType {
  Mnemonic = "mnemonic",
  PrivateKey = "private-key",
}

export type DerivedAccount = {
  id: string;
  address: string;
  alias?: string;
  establishedAddress?: string;
  parentId?: string;
  path: Bip44Path;
  type: AccountType;
};
