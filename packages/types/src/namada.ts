import { AccountType, DerivedAccount } from "./account";
import { Chain } from "./chain";
import { Signer } from "./signer";

export type TxMsgProps = { txMsg: string; type: AccountType };

export interface Namada {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  balances(
    owner: string
  ): Promise<{ token: string; amount: string }[] | undefined>;
  suggestChain(chainConfig: Chain): Promise<void>;
  chain: (chainId: string) => Promise<Chain | undefined>;
  chains: () => Promise<Chain[] | undefined>;
  submitBond: (props: TxMsgProps) => Promise<void>;
  submitUnbond: (props: TxMsgProps) => Promise<void>;
  submitWithdraw: (props: TxMsgProps) => Promise<void>;
  submitTransfer: (props: TxMsgProps) => Promise<void>;
  submitIbcTransfer: (props: TxMsgProps) => Promise<void>;
  encodeInitAccount: (props: {
    txMsg: string;
    address: string;
  }) => Promise<string | undefined>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: (chainId: string) => Signer;
    };
  };
