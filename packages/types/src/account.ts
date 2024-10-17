import { ChainKey } from "./chain";

// The Bip44Path should contain at the minimum an account index
export type Bip44Path = {
  account: number;
  change: number;
  index: number;
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
  path: Bip44Path;
  type: AccountType;
};

export type Account = Pick<
  DerivedAccount,
  "address" | "alias" | "type" | "publicKey" | "owner"
> & {
  chainId: string;
  chainKey: ChainKey;
  isShielded: boolean;
  viewingKey?: string;
};
