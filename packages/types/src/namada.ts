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
};

export type SignBatchProps = {
  txType: unknown;
  // BatchTx Instance (see @heliax/namada-sdk)
  batchTx: unknown;
  signer: string;
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

export interface Namada {
  accounts(chainId?: string): Promise<DerivedAccount[] | undefined>;
  connect(chainId?: string): Promise<void>;
  isConnected(): Promise<boolean | undefined>;
  defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
  // TODO: Return single signed Tx bytes
  sign(props: SignProps): Promise<Uint8Array | undefined>;
  signBatch(props: SignBatchProps): Promise<Uint8Array | undefined>;
  signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined>;
  verify(props: VerifyArbitraryProps): Promise<void>;
  getChain: () => Promise<Chain | undefined>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: () => Signer;
    };
  };
