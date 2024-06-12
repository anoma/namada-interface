import { Account } from "./account";

export type SignArbitraryResponse = {
  hash: string;
  signature: string;
};

export type TxData = {
  txData: Uint8Array;
  signingData: Uint8Array;
};

export interface Signer {
  accounts: (chainId?: string) => Promise<Account[] | undefined>;
  defaultAccount: (chainId?: string) => Promise<Account | undefined>;
  sign: (
    txType: unknown,
    tx: TxData,
    signer: string
  ) => Promise<Uint8Array | undefined>;
  signBatch: (
    txType: unknown,
    // BatchTx instance
    batchTx: unknown,
    signer: string
  ) => Promise<Uint8Array | undefined>;
  signArbitrary: (
    signer: string,
    data: string
  ) => Promise<SignArbitraryResponse | undefined>;
  verify: (publicKey: string, hash: string, signature: string) => Promise<void>;
}
