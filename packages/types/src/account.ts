export type Bip44Path = {
  account: number;
  change: number;
  index?: number;
};

// Type of account for storage
export enum AccountType {
  // A stored mnemonic phrase
  Mnemonic = "mnemonic",
  // A stored private key
  PrivateKey = "private-key",
  // Stored, stringified spending and viewing keys
  ShieldedKeys = "shielded-keys",
}

export type DerivedAccount = {
  id: string;
  chainId: string;
  address: string;
  xvk: string;
  alias: string;
  parentId?: string;
  path: Bip44Path;
  type: AccountType;
};

export type Account = Pick<DerivedAccount, "address" | "alias" | "chainId"> & {
  isShielded: boolean;
};
