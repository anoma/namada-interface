import { Account } from "./account";
import {
  IbcTransferProps,
  InitAccountProps,
  SubmitBondProps,
  SubmitUnbondProps,
  TransferProps,
} from "./tx";

export interface Signer {
  accounts: () => Promise<Account[] | undefined>;
  submitBond(args: SubmitBondProps): Promise<void>;
  submitUnbond(args: SubmitUnbondProps): Promise<void>;
  submitTransfer(args: TransferProps): Promise<void>;
  submitIbcTransfer(args: IbcTransferProps): Promise<void>;
  encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined>;
}
