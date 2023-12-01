import { AccountType, DerivedAccount } from "./account";
import { Signer } from "./signer";

export type TxMsgProps = {
  //TODO: figure out if we can make it better
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txType: any;
  specificMsg: string;
  txMsg: string;
  type: AccountType;
};

export interface Namada {
  connect(): Promise<void>;
  accounts(): Promise<DerivedAccount[] | undefined>;
  defaultAccount(): Promise<DerivedAccount | undefined>;
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
