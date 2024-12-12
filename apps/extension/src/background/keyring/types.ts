import { CryptoRecord } from "@namada/sdk/web";
import { StoredRecord } from "@namada/storage";
import { AccountType, DerivedAccount, Path } from "@namada/types";

export interface AccountStore extends StoredRecord {
  alias: string;
  address: string;
  owner: string;
  publicKey?: string;
  path: Path;
  parentId?: string;
  pseudoExtendedKey?: string;
  type: AccountType;
  source: "imported" | "generated";
  timestamp: number;
}

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

export type TabStore = {
  tabId: number;
  timestamp: number;
};

export type ParentAccount =
  | AccountType.Mnemonic
  | AccountType.Ledger
  | AccountType.PrivateKey;

export type ActiveAccountStore = {
  id: string;
  type: ParentAccount;
};

export type DurablityStore = {
  isDurable: string;
};

export type SensitiveAccountStoreData = { text: string; passphrase?: string };

export type UtilityStore = ActiveAccountStore | { [id: string]: CryptoRecord };

export enum DeleteAccountError {
  BadPassword,
  KeyStoreError,
}

type Mnemonic = { t: "Mnemonic"; seedPhrase: string[]; passphrase: string };
type PrivateKey = { t: "PrivateKey"; privateKey: string };
export type AccountSecret = Mnemonic | PrivateKey;

export type MnemonicValidationResponse = {
  isValid: boolean;
  error?: string;
};

export type SigningKey = {
  privateKey?: string;
  xsk?: string;
};
