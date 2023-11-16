import { StoredRecord } from "@namada/storage";
import { AccountType, Bip44Path, DerivedAccount } from "@namada/types";
import { CryptoRecord } from "background/vault";

export interface AccountStore extends StoredRecord {
  alias: string;
  address: string;
  owner: string;
  chainId: string;
  publicKey?: string;
  path: Bip44Path;
  parentId?: string;
  type: AccountType;
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

export type ParentAccount = AccountType.Mnemonic | AccountType.Ledger;

export type ActiveAccountStore = {
  id: string;
  type: ParentAccount;
};

export type DurablityStore = {
  isDurable: string;
};

export type SensitiveAccountStoreData = { text: string };

export type UtilityStore = ActiveAccountStore | { [id: string]: CryptoRecord };

export type RevealedPKStore = { [id: string]: string };

export enum DeleteAccountError {
  BadPassword,
  KeyStoreError,
}

type Mnemonic = { t: "Mnemonic"; seedPhrase: string[] };
type PrivateKey = { t: "PrivateKey"; privateKey: string };
export type AccountSecret = Mnemonic | PrivateKey;

export type MnemonicValidationResponse = {
  isValid: boolean;
  error?: string;
};
