import { SupportedTx, TxType } from "@heliax/namada-sdk/web";
import { chains } from "@namada/chains";
import {
  Account,
  AccountType,
  BondProps,
  EthBridgeTransferProps,
  Signer as ISigner,
  IbcTransferProps,
  Namada,
  RedelegateProps,
  SignatureResponse,
  SupportedTxProps,
  TransferProps,
  TxProps,
  UnbondProps,
  VoteProposalProps,
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

  private async submitTx(
    txType: SupportedTx,
    txProps: SupportedTxProps | SupportedTxProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    const tx = txProps instanceof Array ? txProps : [txProps];
    return await this._namada.submitTx({
      txType,
      wrapperTxProps,
      txProps: tx,
      type,
    });
  }

  /**
   * Submit bond transaction
   */
  public async submitBond(
    txProps: BondProps | BondProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Bond, txProps, wrapperTxProps, type);
  }

  /**
   * Submit unbond transaction
   */
  public async submitUnbond(
    txProps: UnbondProps | UnbondProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Unbond, txProps, wrapperTxProps, type);
  }

  /**
   * Submit withdraw transaction
   */
  public async submitWithdraw(
    txProps: WithdrawProps | WithdrawProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Withdraw, txProps, wrapperTxProps, type);
  }

  /**
   * Submit redelegate transaction
   */
  public async submitRedelegate(
    txProps: RedelegateProps | RedelegateProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(
      TxType.Redelegate,
      txProps,
      wrapperTxProps,
      type
    );
  }

  /**
   * Submit vote proposal transaction
   */
  public async submitVoteProposal(
    txProps: VoteProposalProps | VoteProposalProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.VoteProposal, txProps, wrapperTxProps, type);
  }

  /**
   * Submit a transfer
   */
  public async submitTransfer(
    txProps: TransferProps | TransferProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.Transfer, txProps, wrapperTxProps, type);
  }

  /**
   * Submit an ibc transfer
   */
  public async submitIbcTransfer(
    txProps: IbcTransferProps | IbcTransferProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(TxType.IBCTransfer, txProps, wrapperTxProps, type);
  }

  /**
   * Submit an eth bridge transfer
   */
  public async submitEthBridgeTransfer(
    txProps: EthBridgeTransferProps | EthBridgeTransferProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void> {
    return this.submitTx(
      TxType.EthBridgeTransfer,
      txProps,
      wrapperTxProps,
      type
    );
  }
}
