import { AccountType, DerivedAccount } from "./account";
import { Chain } from "./chain";
import { SignatureResponse, Signer } from "./signer";

export type TxMsgProps = {
  //TODO: figure out if we can make it better
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txType: any;
  specificMsg: string;
  txMsg: string;
  type: AccountType;
};

export type SignArbitraryProps = {
  signer: string;
  data: string;
};

export interface Namada {
  accounts(chainId?: string): Promise<DerivedAccount[] | undefined>;
  balances(
    owner: string
  ): Promise<{ token: string; amount: string }[] | undefined>;
  connect(chainId?: string): Promise<void>;
  defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
  sign(props: SignArbitraryProps): Promise<SignatureResponse | undefined>;
  submitTx: (props: TxMsgProps) => Promise<void>;
  getChain: () => Promise<Chain | undefined>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: () => Signer;
    };
  };
