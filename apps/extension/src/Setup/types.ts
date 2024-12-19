import { Bip44Path } from "@namada/types";
import { AccountSecret } from "background/keyring";

// Alias and optional password (in the case of Ledger accounts)
export type AccountDetails = {
  alias: string;
  password?: string;
};

export type DeriveAccountDetails = AccountDetails & {
  flow: "create" | "import";
  accountSecret: AccountSecret;
  path: Bip44Path;
  passwordRequired?: boolean;
};

export type LedgerAccountDetails = {
  alias: string;
  path: Bip44Path;
  address: string;
  publicKey: string;
};
