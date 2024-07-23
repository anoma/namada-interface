import { deserialize } from "@dao-xyz/borsh";
import {
  BuiltTx,
  Sdk as SdkWasm,
  TxType,
  deserialize_tx,
} from "@namada/shared";
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
  RevealPkMsgValue,
  SignatureMsgValue,
  SupportedTxProps,
  TransferMsgValue,
  TransparentTransferMsgValue,
  TransparentTransferProps,
  TxDetails,
  TxDetailsMsgValue,
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
import { WasmHash } from "../rpc";
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
   * Build Transfer Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param transferProps -  properties of the transfer
   * @returns promise that resolves to an EncodedTx
   */
  async buildTransparentTransfer(
    wrapperTxProps: WrapperTxProps,
    transferProps: TransparentTransferProps
  ): Promise<EncodedTx> {
    const transferMsg = new Message<TransparentTransferMsgValue>();

    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedTransfer = transferMsg.encode(
      new TransparentTransferMsgValue(transferProps)
    );

    const builtTx = await this.sdk.build_transparent_transfer(
      encodedTransfer,
      encodedWrapperArgs
    );

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build RevealPK Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @returns promise that resolves to an EncodedTx
   */
  async buildRevealPk(wrapperTxProps: WrapperTxProps): Promise<EncodedTx> {
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const builtTx = await this.sdk.build_reveal_pk(encodedWrapperArgs);

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build Bond Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param bondProps -  properties of the bond tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildBond(
    wrapperTxProps: WrapperTxProps,
    bondProps: BondProps
  ): Promise<EncodedTx> {
    const bondMsg = new Message<BondMsgValue>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedBond = bondMsg.encode(new BondMsgValue(bondProps));
    const builtTx = await this.sdk.build_bond(encodedBond, encodedWrapperArgs);

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build Unbond Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param unbondProps - properties of the unbond tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildUnbond(
    wrapperTxProps: WrapperTxProps,
    unbondProps: UnbondProps
  ): Promise<EncodedTx> {
    const unbondMsg = new Message<UnbondMsgValue>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedUnbond = unbondMsg.encode(new UnbondMsgValue(unbondProps));

    const builtTx = await this.sdk.build_unbond(
      encodedUnbond,
      encodedWrapperArgs
    );

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build Withdraw Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param withdrawProps - properties of the withdraw tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildWithdraw(
    wrapperTxProps: WrapperTxProps,
    withdrawProps: WithdrawProps
  ): Promise<EncodedTx> {
    const bondMsg = new Message<WithdrawProps>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedWithdraw = bondMsg.encode(new WithdrawMsgValue(withdrawProps));
    const builtTx = await this.sdk.build_withdraw(
      encodedWithdraw,
      encodedWrapperArgs
    );

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build Redelegate Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param redelegateProps -  properties of the redelegate tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildRedelegate(
    wrapperTxProps: WrapperTxProps,
    redelegateProps: RedelegateProps
  ): Promise<EncodedTx> {
    const redelegateMsg = new Message<RedelegateMsgValue>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedRedelegate = redelegateMsg.encode(
      new RedelegateMsgValue(redelegateProps)
    );
    const builtTx = await this.sdk.build_redelegate(
      encodedRedelegate,
      encodedWrapperArgs
    );

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build Ibc Transfer Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param ibcTransferProps - properties of the ibc transfer tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildIbcTransfer(
    wrapperTxProps: WrapperTxProps,
    ibcTransferProps: IbcTransferProps
  ): Promise<EncodedTx> {
    const ibcTransferMsg = new Message<IbcTransferProps>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedIbcTransfer = ibcTransferMsg.encode(
      new IbcTransferMsgValue(ibcTransferProps)
    );
    const builtTx = await this.sdk.build_ibc_transfer(
      encodedIbcTransfer,
      encodedWrapperArgs
    );

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build Ethereum Bridge Transfer Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param ethBridgeTransferProps - properties of the eth bridge transfer tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildEthBridgeTransfer(
    wrapperTxProps: WrapperTxProps,
    ethBridgeTransferProps: EthBridgeTransferProps
  ): Promise<EncodedTx> {
    const ethBridgeTransferMsg = new Message<EthBridgeTransferProps>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedEthBridgeTransfer = ethBridgeTransferMsg.encode(
      new EthBridgeTransferMsgValue(ethBridgeTransferProps)
    );
    const builtTx = await this.sdk.build_eth_bridge_transfer(
      encodedEthBridgeTransfer,
      encodedWrapperArgs
    );

    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Built Vote Proposal Tx
   * @async
   * @param wrapperTxProps - properties of the transaction
   * @param voteProposalProps - properties of the vote proposal tx
   * @returns promise that resolves to an EncodedTx
   */
  async buildVoteProposal(
    wrapperTxProps: WrapperTxProps,
    voteProposalProps: VoteProposalProps
  ): Promise<EncodedTx> {
    const voteProposalMsg = new Message<VoteProposalProps>();
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    const encodedVoteProposal = voteProposalMsg.encode(
      new VoteProposalMsgValue(voteProposalProps)
    );

    const builtTx = await this.sdk.build_vote_proposal(
      encodedVoteProposal,
      encodedWrapperArgs
    );
    return new EncodedTx(encodedWrapperArgs, builtTx);
  }

  /**
   * Build a batched transaction
   * @param txs - array of BuiltTx types
   * @param wrapperTxMsg - Uint8Array of serialized WrapperTxMsg
   * @returns a BuiltTx type
   */
  buildBatch(txs: BuiltTx[], wrapperTxMsg: Uint8Array): BuiltTx {
    return SdkWasm.build_batch(txs, wrapperTxMsg);
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
    const encodedWrapperArgs = this.encodeTxArgs(wrapperTxProps);
    return await this.sdk.reveal_pk(signingKey, encodedWrapperArgs, chainId);
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
    const wrapperTxMsgValue = new WrapperTxMsgValue(wrapperTxProps);
    const msg = new Message<WrapperTxMsgValue>();
    return msg.encode(wrapperTxMsgValue);
  }

  /**
   * Method to retrieve JSON strings for all commitments of a Tx
   * @param txBytes - Bytes of a transaction
   * @param checksums - Record of paths mapped to their respective hashes
   * @returns a TxDetails object
   */
  deserialize(
    txBytes: Uint8Array,
    checksums: Record<string, string>
  ): TxDetails {
    const wasmHashes: WasmHash[] = [];
    for (const path in checksums) {
      wasmHashes.push({
        path,
        hash: checksums[path],
      });
    }
    const tx = deserialize_tx(txBytes, wasmHashes);
    const { wrapperTx, commitments } = deserialize(tx, TxDetailsMsgValue);

    const getProps = (txType: TxType, data: Uint8Array): SupportedTxProps => {
      switch (txType) {
        case TxType.Bond:
          return deserialize(data, BondMsgValue);
        case TxType.Unbond:
          return deserialize(data, UnbondMsgValue);
        case TxType.Withdraw:
          return deserialize(data, WithdrawMsgValue);
        case TxType.Redelegate:
          return deserialize(data, RedelegateMsgValue);
        case TxType.VoteProposal:
          return deserialize(data, VoteProposalMsgValue);
        case TxType.Transfer:
          return deserialize(data, TransferMsgValue);
        case TxType.RevealPK:
          return deserialize(data, RevealPkMsgValue);
        default:
          throw "Unsupported Tx type!";
      }
    };

    return {
      ...wrapperTx,
      commitments: commitments.map(
        ({ txType, hash, txCodeId, memo, data }) => ({
          txType: txType as TxType,
          hash,
          txCodeId,
          memo,
          ...getProps(txType, data),
        })
      ),
    };
  }
}
