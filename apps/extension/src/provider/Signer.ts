import { toBase64 } from "@cosmjs/encoding";
import { chains } from "@namada/chains";
import { SupportedTx, TxType } from "@namada/sdk/web";
import {
  Account,
  AccountType,
  BondMsgValue,
  BondProps,
  EthBridgeTransferMsgValue,
  EthBridgeTransferProps,
  Signer as ISigner,
  IbcTransferMsgValue,
  IbcTransferProps,
  Message,
  Namada,
  Schema,
  SignatureResponse,
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

export class Signer implements ISigner {
  constructor(private readonly _namada: Namada) {}

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._namada.accounts())?.map(
      ({ alias, address, type, publicKey }) => ({
        alias,
        address,
        chainId: chains.namada.chainId,
        type,
        publicKey,
        isShielded: type === AccountType.ShieldedKeys,
        chainKey: "namada",
      })
    );
  }

  public async defaultAccount(): Promise<Account | undefined> {
    const account = await this._namada.defaultAccount();

    if (account) {
      const { alias, address, type, publicKey } = account;

      return {
        alias,
        address,
        chainId: chains.namada.chainId,
        type,
        publicKey,
        isShielded: type === AccountType.ShieldedKeys,
        chainKey: "namada",
      };
    }
  }

  public async sign(
    signer: string,
    data: string
  ): Promise<SignatureResponse | undefined> {
    return await this._namada.sign({ signer, data });
  }

  public async verify(
    publicKey: string,
    hash: string,
    signature: string
  ): Promise<void> {
    return await this._namada.verify({ publicKey, hash, signature });
  }

  private async submitTx<T extends Schema, Args>(
    txType: SupportedTx,
    constructor: new (args: Args) => T,
    args: Args,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    const msgValue = new constructor(args);
    const msg = new Message<T>();
    const encoded = msg.encode(msgValue);

    const txMsgValue = new TxMsgValue(txArgs);
    const txMsg = new Message<TxMsgValue>();
    const txEncoded = txMsg.encode(txMsgValue);

    return await this._namada.submitTx({
      txType,
      specificMsg: toBase64(encoded),
      txMsg: toBase64(txEncoded),
      type,
    });
  }

  /**
   * Submit bond transaction
   */
  public async submitBond(
    args: BondProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Bond, BondMsgValue, args, txArgs, type);
  }

  /**
   * Submit unbond transaction
   */
  public async submitUnbond(
    args: UnbondProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Unbond, UnbondMsgValue, args, txArgs, type);
  }

  /**
   * Submit withdraw transaction
   */
  public async submitWithdraw(
    args: WithdrawProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Withdraw, WithdrawMsgValue, args, txArgs, type);
  }

  /**
   * Submit vote proposal transaction
   */
  public async submitVoteProposal(
    args: VoteProposalProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(
      TxType.VoteProposal,
      VoteProposalMsgValue,
      args,
      txArgs,
      type
    );
  }

  /**
   * Submit a transfer
   */
  public async submitTransfer(
    args: TransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Transfer, TransferMsgValue, args, txArgs, type);
  }

  /**
   * Submit an ibc transfer
   */
  public async submitIbcTransfer(
    args: IbcTransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(
      TxType.IBCTransfer,
      IbcTransferMsgValue,
      args,
      txArgs,
      type
    );
  }

  /**
   * Submit an eth bridge transfer
   */
  public async submitEthBridgeTransfer(
    args: EthBridgeTransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(
      TxType.EthBridgeTransfer,
      EthBridgeTransferMsgValue,
      args,
      txArgs,
      type
    );
  }
}
