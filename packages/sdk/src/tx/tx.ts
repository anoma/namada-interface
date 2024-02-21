import { Query as QueryWasm, Sdk as SdkWasm, TxType } from "@namada/shared";
import {
  BondMsgValue,
  BondProps,
  Message,
  TransferMsgValue,
  TransferProps,
  TxMsgValue,
  TxProps,
  UnbondMsgValue,
  UnbondProps,
  WithdrawMsgValue,
  WithdrawProps,
} from "@namada/types";
import { EncodedTx, SignedTx } from "tx/types";

export class Tx {
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) {}

  async encodeTx(
    txType: TxType,
    encodedSpecificTx: Uint8Array,
    encodedTxMsg: Uint8Array,
    gasPayer: string
  ): Promise<EncodedTx> {
    const tx = await this.sdk.build_tx(
      txType,
      encodedSpecificTx,
      encodedTxMsg,
      gasPayer
    );

    return new EncodedTx(encodedTxMsg, tx);
  }
  /**
   * Build Transfer Tx
   *
   * @param {TxProps} txProps
   * @param {TransferProps} transferProps
   * @param {string} gasPayer
   *
   * @return {EncodedTx}
   */
  async buildTransfer(
    txProps: TxProps,
    transferProps: TransferProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const transferMsg = new Message<TransferMsgValue>();

    const encodedTxMsg = txMsg.encode(new TxMsgValue(txProps));
    const encodedTransferMsg = transferMsg.encode(
      new TransferMsgValue(transferProps)
    );

    return await this.encodeTx(
      TxType.Transfer,
      encodedTransferMsg,
      encodedTxMsg,
      gasPayer
    );
  }

  /**
   * Build RevealPK Tx
   *
   * @param {TxProps} txProps
   * @param {string} publicKey
   *
   * @return {EncodedTx}
   */
  async buildRevealPk(txProps: TxProps, publicKey: string): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const encodedTxMsg = txMsg.encode(new TxMsgValue(txProps));

    return await this.encodeTx(
      TxType.RevealPK,
      new Uint8Array(),
      encodedTxMsg,
      publicKey
    );
  }

  /**
   * Build Bond Tx
   *
   * @param {TxProps} txProps
   * @param {BondProps} bondProps
   * @param {string} gasPayer
   *
   * @return {EncodedTx}
   */
  async buildBond(
    txProps: TxProps,
    bondProps: BondProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const bondMsg = new Message<BondMsgValue>();

    const encodedTxMsg = txMsg.encode(new TxMsgValue(txProps));
    const encodedBondMsg = bondMsg.encode(new BondMsgValue(bondProps));

    return await this.encodeTx(
      TxType.Bond,
      encodedBondMsg,
      encodedTxMsg,
      gasPayer
    );
  }

  /**
   * Build Unbond Tx
   *
   * @param {TxProps} txProps
   * @param {UnbondProps} unbondProps
   * @param {string} gasPayer
   *
   * @return {EncodedTx}
   */
  async buildUnbond(
    txProps: TxProps,
    unbondProps: UnbondProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const bondMsg = new Message<UnbondMsgValue>();

    const encodedTxMsg = txMsg.encode(new TxMsgValue(txProps));
    const encodedUnbondMsg = bondMsg.encode(new UnbondMsgValue(unbondProps));

    return await this.encodeTx(
      TxType.Unbond,
      encodedUnbondMsg,
      encodedTxMsg,
      gasPayer
    );
  }

  /**
   * Build Withdraw Tx
   *
   * @param {TxProps} txProps
   * @param {WithdrawProps} withdrawProps
   * @param {string} gasPayer
   *
   * @return {EncodedTx}
   */
  async buildWithdraw(
    txProps: TxProps,
    withdrawProps: WithdrawProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const bondMsg = new Message<WithdrawProps>();

    const encodedTxMsg = txMsg.encode(new TxMsgValue(txProps));
    const encodedWithdrawMsg = bondMsg.encode(
      new WithdrawMsgValue(withdrawProps)
    );

    return this.encodeTx(
      TxType.Withdraw,
      encodedWithdrawMsg,
      encodedTxMsg,
      gasPayer
    );
  }
  /**
   * Sign tx
   *
   * @param {EncodedTx} encodedTx
   * @param {string} signingKey
   *
   * @return {EncodedTx}
   */
  async signTx(encodedTx: EncodedTx, signingKey: string): Promise<SignedTx> {
    const { tx, txMsg } = encodedTx;
    const signedTx = await this.sdk.sign_tx(tx, txMsg, signingKey);

    // Free up resources allocated by EncodedTx
    encodedTx.free();

    return new SignedTx(txMsg, signedTx);
  }
}
