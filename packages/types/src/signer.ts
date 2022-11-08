import { Account } from "./account";
import {
  BondingProps,
  IbcTransferProps,
  InitAccountProps,
  SignedTx,
  TransferProps,
  TxProps,
} from "./tx";

export interface Signer {
  accounts: () => Promise<Account[] | undefined>;
  signTx(
    signer: string,
    txProps: TxProps,
    txData: string
  ): Promise<SignedTx | undefined>;
  encodeBonding(args: BondingProps): Promise<string | undefined>;
  encodeTransfer(args: TransferProps): Promise<string | undefined>;
  encodeIbcTransfer(args: IbcTransferProps): Promise<string | undefined>;
  encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined>;
  encodeRevealPk(
    signer: string
  ): Promise<string | undefined>;
}
