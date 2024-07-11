import { DerivedAccount } from "./account";
import { Chain } from "./chain";
import { SignArbitraryResponse, Signer, TxData } from "./signer";

export type SignArbitraryProps = {
  signer: string;
  data: string;
};

export type SignProps = {
  txType: unknown;
  signer: string;
  tx: TxData;
  wrapperTxMsg: Uint8Array;
};

export type VerifyArbitraryProps = {
  publicKey: string;
  hash: string;
  signature: string;
};

export type BalancesProps = {
  owner: string;
  tokens: string[];
};

export type WasmHash = {
  path: string;
  hash: string;
};

export type WasmHashProps = {
  chainId: string;
  wasmHashes: WasmHash[];
};

export interface Namada {
  accounts(chainId?: string): Promise<DerivedAccount[] | undefined>;
  connect(): Promise<void>;
  isConnected(): Promise<boolean | undefined>;
  defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
  sign(props: SignProps): Promise<Uint8Array | undefined>;
  signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined>;
  verify(props: VerifyArbitraryProps): Promise<void>;
  getChain: () => Promise<Chain | undefined>;
  addTxWasmHashes(props: WasmHashProps): Promise<void>;
  getTxWasmHashes(chainId: string): Promise<WasmHash[] | undefined>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: () => Signer;
    };
  };
