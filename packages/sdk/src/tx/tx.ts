import { Sdk as SdkWasm, TxType } from "@namada/shared";
import {
  BondMsgValue,
  BondProps,
  EthBridgeTransferMsgValue,
  EthBridgeTransferProps,
  IbcTransferMsgValue,
  IbcTransferProps,
  Message,
  SignatureMsgValue,
  TransferMsgValue,
  TransferProps,
  TxMsgValue,
  TxProps,
  UnbondMsgValue,
  UnbondProps,
  VoteProposalMsgValue,
  VoteProposalProps,
  WithdrawMsgValue,
  WithdrawProps,
} from "@namada/types";
import { ResponseSign } from "@zondax/ledger-namada";
import { EncodedTx, SignedTx } from "tx/types";

/**
 * SDK functionality related to transactions
 */
export class Tx {
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Build a transaction
   * @param {TxType} txType
   * @param {Uint8Array} encodedSpecificTx
   * @param {Uint8Array} encodedTx
   * @returns {EncodedTx}
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
   * @param {TxProps} txProps
   * @param {TransferProps} transferProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
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
   * @param {TxProps} txProps
   * @param {string} publicKey
   * @returns {EncodedTx}
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
   * @param {TxProps} txProps
   * @param {BondProps} bondProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
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
   * @param {TxProps} txProps
   * @param {UnbondProps} unbondProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
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
   * @param {TxProps} txProps
   * @param {WithdrawProps} withdrawProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
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
   * Build Ibc Transfer Tx
   * @param {TxProps} txProps
   * @param {IbcTransferProps} ibcTransferProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
   */
  async buildIbcTransfer(
    txProps: TxProps,
    ibcTransferProps: IbcTransferProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const ibcTransferMsg = new Message<IbcTransferProps>();

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedIbcTransfer = ibcTransferMsg.encode(
      new IbcTransferMsgValue(ibcTransferProps)
    );

    return this.buildTx(
      TxType.IBCTransfer,
      encodedIbcTransfer,
      encodedTx,
      gasPayer
    );
  }

  /**
   * Build Ethereum Bridge Transfer Tx
   * @param {TxProps} txProps
   * @param {EthBridgeTransferProps} ethBridgeTransferProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
   */
  async buildEthBridgeTransfer(
    txProps: TxProps,
    ethBridgeTransferProps: EthBridgeTransferProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const ethBridgeTransferMsg = new Message<EthBridgeTransferProps>();

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedEthBridgeTransfer = ethBridgeTransferMsg.encode(
      new EthBridgeTransferMsgValue(ethBridgeTransferProps)
    );

    return this.buildTx(
      TxType.EthBridgeTransfer,
      encodedEthBridgeTransfer,
      encodedTx,
      gasPayer
    );
  }

  /**
   * Built Vote Proposal Tx
   * @param {TxProps} txProps
   * @param {VoteProposalProps} voteProposalProps
   * @param {string} gasPayer
   * @returns {EncodedTx}
   */
  async buildVoteProposal(
    txProps: TxProps,
    voteProposalProps: VoteProposalProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const voteProposalMsg = new Message<VoteProposalProps>();

    const encodedTx = txMsg.encode(new TxMsgValue(txProps));
    const encodedVoteProposal = voteProposalMsg.encode(
      new VoteProposalMsgValue(voteProposalProps)
    );

    return this.buildTx(
      TxType.VoteProposal,
      encodedVoteProposal,
      encodedTx,
      gasPayer
    );
  }

  /**
   * Sign transaction
   * @param {EncodedTx} encodedTx
   * @param {string} signingKey
   * @returns {EncodedTx}
   */
  async signTx(encodedTx: EncodedTx, signingKey: string): Promise<SignedTx> {
    const { tx, txMsg } = encodedTx;
    const signedTx = await this.sdk.sign_tx(tx, txMsg, signingKey);

    // Free up resources allocated by EncodedTx
    encodedTx.free();

    return new SignedTx(txMsg, signedTx);
  }

  /**
   * Append signature for transactions signed by Ledger Hardware Wallet
   * @param {Uint8Array} txBytes - Serialized transaction
   * @param {ResponseSign} ledgerSignatureResponse - Serialized signature as returned from Ledger
   * @returns {Uint8Array} - Serialized Tx bytes with signature appended
   */
  appendSignature(
    txBytes: Uint8Array,
    ledgerSignatureResponse: ResponseSign
  ): Uint8Array {
    const ledgerSignature = ledgerSignatureResponse.signature;
    if (!ledgerSignature) {
      throw new Error("Signature was not returned from Ledger!");
    }

    const {
      pubkey,
      raw_indices,
      raw_signature,
      wrapper_indices,
      wrapper_signature,
    } = ledgerSignature;

    // Construct props from ledgerSignature
    /* eslint-disable */
    const props = {
      pubkey: new Uint8Array((pubkey as any).data),
      rawIndices: new Uint8Array((raw_indices as any).data),
      rawSignature: new Uint8Array((raw_signature as any).data),
      wrapperIndices: new Uint8Array((wrapper_indices as any).data),
      wrapperSignature: new Uint8Array((wrapper_signature as any).data),
    };
    /* eslint-enable */

    // Serialize signature
    const value = new SignatureMsgValue(props);
    const msg = new Message<SignatureMsgValue>();
    const encodedSignature = msg.encode(value);

    return this.sdk.append_signature(txBytes, encodedSignature);
  }
}
