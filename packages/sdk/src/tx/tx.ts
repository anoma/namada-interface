import { Sdk as SdkWasm, TxType } from "@namada/shared";
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
  constructor(protected readonly sdk: SdkWasm) { }

  /**
   * Build a transaction
   *
   * @param {TxType} txType
   * @param {Uint8Array} encodedSpecificTx
   * @param {Uint8Array} encodedTx
   *
   * @return {EncodedTx}
   */
  async buildTx(
    txType: TxType,
    encodedSpecificTx: Uint8Array,
    encodedTx: Uint8Array,
    gasPayer: string
  ): Promise<EncodedTx> {
    const tx = await this.sdk.build_tx(
      txType,
      encodedSpecificTx,
      encodedTx,
      gasPayer
    );

    return new EncodedTx(encodedTx, tx);
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

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedTransfer = transferMsg.encode(
      new TransferMsgValue(transferProps)
    );

    return await this.buildTx(
      TxType.Transfer,
      encodedTransfer,
      encodedTx,
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
    const encodedTx = txMsg.encode(new TxMsgValue(txProps));

    return await this.buildTx(
      TxType.RevealPK,
      new Uint8Array(),
      encodedTx,
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

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedBond = bondMsg.encode(new BondMsgValue(bondProps));

    return await this.buildTx(TxType.Bond, encodedBond, encodedTx, gasPayer);
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

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedUnbond = bondMsg.encode(new UnbondMsgValue(unbondProps));

    return await this.buildTx(
      TxType.Unbond,
      encodedUnbond,
      encodedTx,
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

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedWithdraw = bondMsg.encode(new WithdrawMsgValue(withdrawProps));

    return this.buildTx(TxType.Withdraw, encodedWithdraw, encodedTx, gasPayer);
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
