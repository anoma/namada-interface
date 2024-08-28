import { Account } from "./account";
import { TxProps } from "./tx";

export type SignArbitraryResponse = {
  hash: string;
  signature: string;
};

export interface Signer {
  accounts: (chainId?: string) => Promise<Account[] | undefined>;
  defaultAccount: (chainId?: string) => Promise<Account | undefined>;
  sign: (
    tx: TxProps | TxProps[],
    signer: string,
    checksums?: Record<string, string>
  ) => Promise<Uint8Array[] | undefined>;
  signArbitrary: (
    signer: string,
    data: string
  ) => Promise<SignArbitraryResponse | undefined>;
  verify: (publicKey: string, hash: string, signature: string) => Promise<void>;
}
