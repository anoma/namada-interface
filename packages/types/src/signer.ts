import { TxProps } from "./tx";

export type SignArbitraryResponse = {
  hash: string;
  signature: string;
};

export type GenDisposableSignerResponse = {
  publicKey: string;
  address: string;
};

export interface Signer {
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
  genDisposableKeypair: () => Promise<GenDisposableSignerResponse | undefined>;
  persistDisposableKeypair: (address: string) => Promise<void>;
  clearDisposableKeypair: (address: string) => Promise<void>;
}
