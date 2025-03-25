import { NamadaKeychainAccount } from "./account";
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

export type GenDisposableSignerProps = {
  persisted: boolean;
};

export interface Namada {
  accounts(): Promise<readonly NamadaKeychainAccount[] | undefined>;
  connect(chainId?: string): Promise<void>;
  disconnect(chainId?: string): Promise<void>;
  isConnected(chainId?: string): Promise<boolean | undefined>;
  defaultAccount(): Promise<NamadaKeychainAccount | undefined>;
  updateDefaultAccount(address: string): Promise<void>;
  sign(props: SignProps): Promise<Uint8Array[] | undefined>;
  signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined>;
  verify(props: VerifyArbitraryProps): Promise<void>;
  genDisposableKeypair(
    props: GenDisposableSignerProps
  ): Promise<GenDisposableSignerResponse | undefined>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: () => Signer;
    };
  };
