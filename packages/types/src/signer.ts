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
  encodeTransfer(args: TransferProps): Promise<Uint8Array | undefined>;
  encodeIbcTransfer(args: IbcTransferProps): Promise<Uint8Array | undefined>;
  encodeInitAccount(
    signer: string,
    args: InitAccountProps
  ): Promise<Uint8Array | undefined>;
}
