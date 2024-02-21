import {
  BuiltTx,
  Query as QueryWasm,
  Sdk as SdkWasm,
  TxType,
} from "@namada/shared";
import { Message, TransferMsgValue, TxMsgValue } from "@namada/types";
import { TransferProps, TxProps } from "types";

export class Tx {
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) { }

  /**
   * Build transfer
   *
   * @param {TxProps} txProps
   * @param {TransferProps} transferProps
   * @param {string} gasPayer
   *
   * @return {Uint8Array}
   */
  async buildTransfer(
    txProps: TxProps,
    transferProps: TransferProps,
    gasPayer: string
  ): Promise<Uint8Array> {
    const txMsg = new Message<TxMsgValue>();
    const transferMsg = new Message<TransferMsgValue>();

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedTransfer = transferMsg.encode(
      new TransferMsgValue(transferProps)
    );
    const tx = await this.sdk.build_tx(
      TxType.Transfer,
      encodedTx,
      encodedTransfer,
      gasPayer
    );

    return tx;
  }

  /**
   * Sign tx
   *
   * @param {BuiltTx} tx
   * @param {Uint8Array} txMsg
   * @param {string} signingKey
   *
   * @return {Uint8Array}
   */
  async signTx(
    tx: BuiltTx,
    txMsg: Uint8Array,
    signingKey: string
  ): Promise<Uint8Array> {
    return await this.sdk.sign_tx(tx, txMsg, signingKey);
  }
}
