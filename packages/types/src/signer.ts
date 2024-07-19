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
  // TODO: Simplify these props!
  // Remove txType & wrapperTxMsg!
  sign: (
    txType: unknown,
    tx: TxData,
    signer: string,
    wrapperTxMsg: Uint8Array,
    checksums?: Record<string, string>
  ) => Promise<Uint8Array | undefined>;
  signArbitrary: (
    signer: string,
    data: string
  ) => Promise<SignArbitraryResponse | undefined>;
  verify: (publicKey: string, hash: string, signature: string) => Promise<void>;
}
