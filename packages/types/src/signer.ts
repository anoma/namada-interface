import { Account } from "./account";
import {
  BondingProps,
  BondProps,
  IbcTransferProps,
  InitAccountProps,
  SignedTx,
  TransferProps,
  Tx,
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
  submitBond(args: { bond: BondProps; tx: Tx }): Promise<void>;
  encodeTransfer(args: TransferProps): Promise<string | undefined>;
  encodeIbcTransfer(args: IbcTransferProps): Promise<string | undefined>;
  encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined>;
  encodeRevealPk(signer: string): Promise<string | undefined>;
}
