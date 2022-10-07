import { DerivedAccount } from "./account";
import {
  IbcTransferProps,
  InitAccountProps,
  SignedTx,
  TransferProps,
  TxProps,
} from "./tx";

export interface Signer<T = DerivedAccount> {
  accounts: () => Promise<T[]>;
  signTx(
    signer: string,
    txProps: TxProps,
    encodedTx: Uint8Array
  ): Promise<SignedTx>;
  encodeTransfer(args: TransferProps): Uint8Array;
  encodeIbcTransfer(args: IbcTransferProps): Uint8Array;
  encodeInitAccount(
    signer: string,
    args: InitAccountProps
  ): Promise<Uint8Array>;
}
