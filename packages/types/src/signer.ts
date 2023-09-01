import { Account, AccountType } from "./account";
import {
  IbcTransferProps,
  InitAccountProps,
  SubmitBondProps,
  SubmitUnbondProps,
  SubmitWithdrawProps,
  TransferProps,
} from "./tx";

export interface Signer {
  accounts: () => Promise<Account[] | undefined>;
  submitBond(args: SubmitBondProps, type: AccountType): Promise<void>;
  submitUnbond(args: SubmitUnbondProps, type: AccountType): Promise<void>;
  submitWithdraw(args: SubmitWithdrawProps, type: AccountType): Promise<void>;
  submitTransfer(args: TransferProps, type: AccountType): Promise<void>;
  submitIbcTransfer(args: IbcTransferProps, type: AccountType): Promise<void>;
  encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined>;
}
