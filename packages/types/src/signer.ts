import { Account } from "./account";

export type SignArbitraryResponse = {
  hash: string;
  signature: string;
};

export type TxData = {
  txBytes: Uint8Array;
  signingDataBytes: Uint8Array[];
};

export interface Signer {
  accounts: (chainId?: string) => Promise<Account[] | undefined>;
  defaultAccount: (chainId?: string) => Promise<Account | undefined>;
  sign: (
    tx: TxData,
    signer: string,
    checksums?: Record<string, string>,
    txs?: TxData[]
  ) => Promise<Uint8Array | undefined>;
  signArbitrary: (
    signer: string,
    data: string
  ) => Promise<SignArbitraryResponse | undefined>;
  verify: (publicKey: string, hash: string, signature: string) => Promise<void>;
}
