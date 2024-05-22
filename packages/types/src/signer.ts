import { Account, AccountType } from "./account";

export type SignArbitraryResponse = {
  hash: string;
  signature: string;
};

export interface Signer {
  accounts: (chainId?: string) => Promise<Account[] | undefined>;
  defaultAccount: (chainId?: string) => Promise<Account | undefined>;
  sign: (
    signer: string,
    tx: unknown | unknown[],
    accountType?: AccountType
  ) => Promise<Uint8Array[] | undefined>;
  signLedger: (
    signer: string,
    tx: unknown | unknown[]
  ) => Promise<Uint8Array[] | undefined>;
  signArbitrary: (
    signer: string,
    data: string
  ) => Promise<SignArbitraryResponse | undefined>;
  verify: (publicKey: string, hash: string, signature: string) => Promise<void>;
}
