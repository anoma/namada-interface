import { Account, AccountType } from "./account";
import {
  BridgeTransferProps,
  IbcTransferProps,
  SubmitBondProps,
  SubmitUnbondProps,
  SubmitWithdrawProps,
  TransferProps,
  TxProps,
} from "./tx";

export interface Signer {
  accounts: () => Promise<Account[] | undefined>;
  submitBond(args: SubmitBondProps, txArgs: TxProps, type: AccountType): Promise<void>;
  submitUnbond(args: SubmitUnbondProps, txArgs: TxProps, type: AccountType): Promise<void>;
  submitWithdraw(args: SubmitWithdrawProps, txArgs: TxProps, type: AccountType): Promise<void>;
  submitTransfer(args: TransferProps, txArgs: TxProps, type: AccountType): Promise<void>;
  submitIbcTransfer(args: IbcTransferProps, txArgs: TxProps, type: AccountType): Promise<void>;
  submitEthBridgeTransfer(
    args: BridgeTransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
}
