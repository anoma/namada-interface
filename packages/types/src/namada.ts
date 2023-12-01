import { SupportedTx } from "@namada/types";
import { AccountType, DerivedAccount } from "./account";
import { Signer } from "./signer";

export type TxMsgProps = {
  txType: SupportedTx;
  specificMsg: string;
  txMsg: string;
  type: AccountType;
};

export interface Namada {
  connect(chainId?: string): Promise<void>;
  accounts(chainId?: string): Promise<DerivedAccount[] | undefined>;
  defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
  balances(
    owner: string
  ): Promise<{ token: string; amount: string }[] | undefined>;
  submitTx: (props: TxMsgProps) => Promise<void>;
  version: () => string;
}

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: () => Signer;
    };
  };
