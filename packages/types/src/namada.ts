import { Account } from "./account";
import {
  GenDisposableSignerResponse,
  SignArbitraryResponse,
  Signer,
} from "./signer";
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
  accounts(): Promise<readonly Account[] | undefined>;
  connect(chainId?: string): Promise<void>;
  disconnect(chainId?: string): Promise<void>;
  isConnected(chainId?: string): Promise<boolean | undefined>;
  defaultAccount(): Promise<Account | undefined>;
  updateDefaultAccount(address: string): Promise<void>;
  sign(props: SignProps): Promise<Uint8Array[] | undefined>;
  signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined>;
  verify(props: VerifyArbitraryProps): Promise<void>;
  genDisposableKeypair(): Promise<GenDisposableSignerResponse | undefined>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: () => Signer;
    };
  };
