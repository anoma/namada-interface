export type Bip44Path = {
  account: number;
  change: number;
  index: number;
};

export type Zip32Path = {
  account: number;
  index?: number;
};

// Generic type for storing either Bip44 or Zip32 path
export type Path = {
  account: number;
  change?: number;
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
  // Ledger account
  Ledger = "ledger",
}

export type DerivedAccount = {
  id: string;
  address: string;
  owner?: string;
  publicKey?: string;
  alias: string;
  parentId?: string;
  path: Path;
  type: AccountType;
  pseudoExtendedKey?: string;
  source?: "imported" | "generated";
  timestamp?: number;
};

export type Account = Pick<
  DerivedAccount,
  | "address"
  | "alias"
  | "type"
  | "publicKey"
  | "owner"
  | "pseudoExtendedKey"
  | "source"
  | "timestamp"
> & {
  viewingKey?: string;
};

/**
 * ViewingKey with optional birthday
 */
export type DatedViewingKey = {
  key: string;
  birthday: number;
};
