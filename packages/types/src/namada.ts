import { AccountType, DerivedAccount } from "./account";
import { Chain } from "./chain";
import { SignArbitraryResponse, Signer } from "./signer";

export type TxMsgProps = {
  //TODO: figure out if we can make it better
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txType: any;
  tx: {
    specificMsg: string;
    txMsg: string;
  }[];
  type: AccountType;
};

export type SignArbitraryProps = {
  signer: string;
  data: string;
};

export type SignProps = {
  signer: string;
  tx: Uint8Array;
  signingData: Uint8Array;
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
  shieldedSync(): Promise<void>;
  connect(chainId?: string): Promise<void>;
  isConnected(): Promise<boolean | undefined>;
  defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
  sign(props: SignProps): Promise<Uint8Array | undefined>;
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
