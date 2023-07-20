import { Account, AccountType } from "./account";
import {
  IbcTransferProps,
  InitAccountProps,
  SubmitBondProps,
  SubmitUnbondProps,
  TransferProps,
} from "./tx";

export interface Signer {
  accounts: () => Promise<Account[] | undefined>;
  submitBond(
    args: SubmitBondProps,
    type: AccountType,
    publicKey?: string
  ): Promise<void>;
  submitUnbond(args: SubmitUnbondProps): Promise<void>;
  submitTransfer(args: TransferProps, type: AccountType): Promise<void>;
  submitIbcTransfer(args: IbcTransferProps): Promise<void>;
  encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined>;
}
