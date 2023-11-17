import { AccountType, DerivedAccount } from "./account";
import { Chain } from "./chain";
import { Signer } from "./signer";

export type TxMsgProps = {
  //TODO: use SupportedTx
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txType: any;
  specificMsg: string;
  txMsg: string;
  type: AccountType;
};

export interface Namada {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  balances(
    owner: string
  ): Promise<{ token: string; amount: string }[] | undefined>;
  suggestChain(chainConfig: Chain): Promise<void>;
  chain: (chainId: string) => Promise<Chain | undefined>;
  chains: () => Promise<Chain[] | undefined>;
  submitTx: (props: TxMsgProps) => Promise<void>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: (chainId: string) => Signer;
    };
  };
