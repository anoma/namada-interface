import { DerivedAccount } from "./account";
import { Chain } from "./chain";
import { SignArbitraryResponse, Signer } from "./signer";
import { TxProps } from "./tx";

export type SignArbitraryProps = {
  signer: string;
  data: string;
};

export type SignProps = {
  signer: string;
  txs: TxProps[];
  checksums?: Record<string, string>;
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
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean | undefined>;
  defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
  updateDefaultAccount(address: string): Promise<void>;
  sign(props: SignProps): Promise<Uint8Array[] | undefined>;
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
