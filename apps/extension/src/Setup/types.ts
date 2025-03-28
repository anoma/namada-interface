import { Bip44Path, Zip32Path } from "@namada/types";
import { AccountSecret } from "background/keyring";

// Alias and optional password (in the case of Ledger accounts)
export type AccountDetails = {
  alias: string;
  password?: string;
};

export type DeriveAccountDetails = AccountDetails & {
  flow: "create" | "import";
  accountSecret: AccountSecret;
  bip44Path: Bip44Path;
  zip32Path: Zip32Path;
  passwordRequired?: boolean;
};

export type LedgerAccountDetails = {
  alias: string;
  bip44Path: Bip44Path;
  zip32Path: Zip32Path;
  address: string;
  publicKey: string;
  extendedViewingKey: string;
  pseudoExtendedKey: string;
  paymentAddress: string;
  diversifierIndex: number;
};
