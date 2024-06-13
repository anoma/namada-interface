import { BatchTx, BuiltTx, Sdk as SdkWasm, TxType } from "@namada/shared";
import {
  BondMsgValue,
  BondProps,
  EthBridgeTransferMsgValue,
  EthBridgeTransferProps,
  IbcTransferMsgValue,
  IbcTransferProps,
  Message,
  RedelegateMsgValue,
  RedelegateProps,
  SignatureMsgValue,
  TransparentTransferMsgValue,
  TransparentTransferProps,
  UnbondMsgValue,
  UnbondProps,
  VoteProposalMsgValue,
  VoteProposalProps,
  WithdrawMsgValue,
  WithdrawProps,
  WrapperTxMsgValue,
  WrapperTxProps,
} from "@namada/types";
import { ResponseSign } from "@zondax/ledger-namada";
import { EncodedTx } from "./types";

/**
 * SDK functionality related to transactions
 */
export class Tx {
  /**
   * @param sdk - Instance of Sdk struct from wasm lib
   */
  constructor(protected readonly sdk: SdkWasm) {}

  /**
   * Build a transaction
   * @async
   * @param txType - type of the transaction
   * @param encodedSpecificTx - encoded specific transaction
   * @param wrapperTxMsg - encoded transaction
   * @param gasPayer - address of the gas payer
   * @returns promise that resolves to an EncodedTx
   */
  async buildTxFromSerializedArgs(
    txType: TxType,
    encodedSpecificTx: Uint8Array,
    wrapperTxMsg: Uint8Array,
    gasPayer: string
  ): Promise<EncodedTx> {
    const tx = await this.sdk.build_tx(
      txType,
      encodedSpecificTx,
      wrapperTxMsg,
      gasPayer
    );

    return new EncodedTx(wrapperTxMsg, tx);
  }

  /**
   * Wrapper method to handle all supported Tx
   * @async
   * @param txType - type of the transaction
   * @param wrapperTxProps - transaction properties
   * @param props - Props specific to type of Tx
   * @param [gasPayer] - optional gas payer, defaults to source or sender
   * @returns promise that resolves to an EncodedTx
   */
  async buildTx(
    txType: TxType,
    wrapperTxProps: WrapperTxProps,
    props: unknown,
    gasPayer?: string
  ): Promise<EncodedTx> {
    switch (txType) {
      case TxType.Bond:
        return await this.buildBond(
          wrapperTxProps,
          props as BondProps,
          gasPayer
        );
      case TxType.Unbond:
        return await this.buildUnbond(
          wrapperTxProps,
          props as UnbondProps,
          gasPayer
        );
      case TxType.Withdraw:
        return await this.buildWithdraw(
          wrapperTxProps,
          props as WithdrawProps,
          gasPayer
        );
      case TxType.Redelegate:
        return await this.buildRedelegate(
          wrapperTxProps,
          props as RedelegateProps,
          gasPayer
        );
      case TxType.RevealPK:
        const { publicKey } = wrapperTxProps;
        if (!publicKey) {
          throw new Error("For RevealPK you must provide a public key!");
        }
        return await this.buildRevealPk(wrapperTxProps, publicKey);
      case TxType.TransparentTransfer:
        return await this.buildTransparentTransfer(
          wrapperTxProps,
          props as TransparentTransferProps,
          gasPayer
        );
      case TxType.IBCTransfer:
        return await this.buildIbcTransfer(
          wrapperTxProps,
          props as IbcTransferProps,
          gasPayer
        );
      case TxType.VoteProposal:
        return await this.buildVoteProposal(
          wrapperTxProps,
          props as VoteProposalProps,
          gasPayer
        );
      case TxType.EthBridgeTransfer:
        return await this.buildEthBridgeTransfer(
          wrapperTxProps,
          props as EthBridgeTransferProps,
          gasPayer
        );
      default:
        throw new Error(`Unsupported Tx type: ${txType}`);
    }
  }

  /**
   * Build Transfer Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param transferProps -  properties of the transfer
   * @param [gasPayer] - optional gas payer, if not provided, defaults to transferProps.source
   * @returns promise that resolves to an EncodedTx
   */
  async buildTransparentTransfer(
    wrapperTxProps: WrapperTxProps,
    transferProps: TransparentTransferMsgValue,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const transferMsg = new Message<TransparentTransferMsgValue>();

    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedTransfer = transferMsg.encode(
      new TransparentTransferMsgValue(transferProps)
    );

    return await this.buildTxFromSerializedArgs(
      TxType.TransparentTransfer,
      encodedTransfer,
      encodedTx,
      gasPayer || transferProps.source
    );
  }

  /**
   * Build RevealPK Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param gasPayer - address for gas payer
   * @returns promise that resolves to an EncodedTx
   */
  async buildRevealPk(
    wrapperTxProps: WrapperTxProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const encodedTx = this.encodeTxArgs(wrapperTxProps);

    return await this.buildTxFromSerializedArgs(
      TxType.RevealPK,
      new Uint8Array(),
      encodedTx,
      gasPayer
    );
  }

  /**
   * Build Bond Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param bondProps -  properties of the bond tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to bondProps.source
   * @returns promise that resolves to an EncodedTx
   */
  async buildBond(
    wrapperTxProps: WrapperTxProps,
    bondProps: BondProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const bondMsg = new Message<BondMsgValue>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedBond = bondMsg.encode(new BondMsgValue(bondProps));

    return await this.buildTxFromSerializedArgs(
      TxType.Bond,
      encodedBond,
      encodedTx,
      gasPayer || bondProps.source
    );
  }

  /**
   * Build Unbond Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param unbondProps - properties of the unbond tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to unbondProps.source
   * @returns promise that resolves to an EncodedTx
   */
  async buildUnbond(
    wrapperTxProps: WrapperTxProps,
    unbondProps: UnbondProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const bondMsg = new Message<UnbondMsgValue>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedUnbond = bondMsg.encode(new UnbondMsgValue(unbondProps));

    return await this.buildTxFromSerializedArgs(
      TxType.Unbond,
      encodedUnbond,
      encodedTx,
      gasPayer || unbondProps.source
    );
  }

  /**
   * Build Withdraw Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param withdrawProps - properties of the withdraw tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to withdrawProps.source
   * @returns promise that resolves to an EncodedTx
   */
  async buildWithdraw(
    wrapperTxProps: WrapperTxProps,
    withdrawProps: WithdrawProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const bondMsg = new Message<WithdrawProps>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedWithdraw = bondMsg.encode(new WithdrawMsgValue(withdrawProps));

    return await this.buildTxFromSerializedArgs(
      TxType.Withdraw,
      encodedWithdraw,
      encodedTx,
      gasPayer || withdrawProps.source
    );
  }

  /**
   * Build Redelegate Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param redelegateProps -  properties of the redelegate tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to redelegateProps.owner
   * @returns promise that resolves to an EncodedTx
   */
  async buildRedelegate(
    wrapperTxProps: WrapperTxProps,
    redelegateProps: RedelegateProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const redelegateMsg = new Message<RedelegateMsgValue>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedRedelegate = redelegateMsg.encode(
      new RedelegateMsgValue(redelegateProps)
    );

    return await this.buildTxFromSerializedArgs(
      TxType.Redelegate,
      encodedRedelegate,
      encodedTx,
      gasPayer || redelegateProps.owner
    );
  }

  /**
   * Build Ibc Transfer Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param ibcTransferProps - properties of the ibc transfer tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to ibcTransferProps.source
   * @returns promise that resolves to an EncodedTx
   */
  async buildIbcTransfer(
    wrapperTxProps: WrapperTxProps,
    ibcTransferProps: IbcTransferProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const ibcTransferMsg = new Message<IbcTransferProps>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedIbcTransfer = ibcTransferMsg.encode(
      new IbcTransferMsgValue(ibcTransferProps)
    );

    return await this.buildTxFromSerializedArgs(
      TxType.IBCTransfer,
      encodedIbcTransfer,
      encodedTx,
      gasPayer || ibcTransferProps.source
    );
  }

  /**
   * Build Ethereum Bridge Transfer Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param ethBridgeTransferProps - properties of the eth bridge transfer tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to ethBridgeTransferProps.sender
   * @returns promise that resolves to an EncodedTx
   */
  async buildEthBridgeTransfer(
    wrapperTxProps: WrapperTxProps,
    ethBridgeTransferProps: EthBridgeTransferProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const ethBridgeTransferMsg = new Message<EthBridgeTransferProps>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedEthBridgeTransfer = ethBridgeTransferMsg.encode(
      new EthBridgeTransferMsgValue(ethBridgeTransferProps)
    );

    return await this.buildTxFromSerializedArgs(
      TxType.EthBridgeTransfer,
      encodedEthBridgeTransfer,
      encodedTx,
      gasPayer || ethBridgeTransferProps.sender
    );
  }

  /**
   * Built Vote Proposal Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param voteProposalProps - properties of the vote proposal tx
   * @param [gasPayer] - optional gas payer, if not provided, defaults to voteProposalProps.signer
   * @returns promise that resolves to an EncodedTx
   */
  async buildVoteProposal(
    wrapperTxProps: WrapperTxProps,
    voteProposalProps: VoteProposalProps,
    gasPayer?: string
  ): Promise<EncodedTx> {
    const voteProposalMsg = new Message<VoteProposalProps>();
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    const encodedVoteProposal = voteProposalMsg.encode(
      new VoteProposalMsgValue(voteProposalProps)
    );

    return await this.buildTxFromSerializedArgs(
      TxType.VoteProposal,
      encodedVoteProposal,
      encodedTx,
      gasPayer || voteProposalProps.signer
    );
  }

  /**
   * Build a batched transaction
   * @param txType - transaction type enum
   * @param txs - array of BuiltTx types
   * @param wrapperTxMsg - Uint8Array of serialized WrapperTxMsg
   * @returns a BatchTx type
   */
  buildBatch(
    txType: TxType,
    txs: BuiltTx[],
    wrapperTxMsg: Uint8Array
  ): BatchTx {
    return SdkWasm.build_batch(txType, txs, wrapperTxMsg);
  }

  /**
   * Reveal Public Key using serialized Tx
   * @async
   * @param signingKey - signing key
   * @param wrapperTxProps - properties of the transaction
   * @param [chainId] - optional chain ID - will enforce validation if present
   * @returns void
   */
  async revealPk(
    signingKey: string,
    wrapperTxProps: WrapperTxProps,
    chainId?: string
  ): Promise<void> {
    const encodedTx = this.encodeTxArgs(wrapperTxProps);
    return await this.sdk.reveal_pk(signingKey, encodedTx, chainId);
  }

  /**
   * Append signature for transactions signed by Ledger Hardware Wallet
   * @param txBytes - Serialized transaction
   * @param ledgerSignatureResponse - Serialized signature as returned from Ledger
   * @returns - Serialized Tx bytes with signature appended
   */
  appendSignature(
    txBytes: Uint8Array,
    ledgerSignatureResponse: ResponseSign
  ): Uint8Array {
    const { signature } = ledgerSignatureResponse;
    if (!signature) {
      throw new Error("Signature was not returned from Ledger!");
    }

    const {
      pubkey,
      raw_indices,
      raw_signature,
      wrapper_indices,
      wrapper_signature,
    } = signature;

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

  /**
   * Helper to encode Tx args given TxProps
   * @param wrapperTxProps - properties of the transaction
   * @returns Serialized WrapperTxMsgValue
   */
  encodeTxArgs(wrapperTxProps: WrapperTxProps): Uint8Array {
    const txMsgValue = new WrapperTxMsgValue(wrapperTxProps);
    const msg = new Message<WrapperTxMsgValue>();
    return msg.encode(txMsgValue);
  }
}
