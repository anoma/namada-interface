import { Account } from "./account";
import {
  IbcTransferProps,
  InitAccountProps,
  SignedTx,
  SubmitBondProps,
  SubmitUnbondProps,
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
  submitBond(args: SubmitBondProps): Promise<void>;
  submitUnbond(args: SubmitUnbondProps): Promise<void>;
  submitTransfer(args: TransferProps): Promise<void>;
  encodeIbcTransfer(args: IbcTransferProps): Promise<string | undefined>;
  encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined>;
  encodeRevealPk(signer: string): Promise<string | undefined>;
}
