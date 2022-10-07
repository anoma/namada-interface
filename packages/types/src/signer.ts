import { Account } from "./account";
import {
  IbcTransferProps,
  InitAccountProps,
  SignedTx,
  TransferProps,
  TxProps,
} from "./tx";

export interface Signer<T = Account> {
  accounts: () => Promise<T[] | undefined>;
  signTx(
    signer: string,
    txProps: TxProps,
    encodedTx: Uint8Array,
    txData: Uint8Array
  ): Promise<SignedTx | undefined>;
  encodeTransfer(args: TransferProps): Uint8Array;
  encodeIbcTransfer(args: IbcTransferProps): Uint8Array;
  encodeInitAccount(
    signer: string,
    args: InitAccountProps
  ): Promise<Uint8Array>;
}
