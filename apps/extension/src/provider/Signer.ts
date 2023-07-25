import { toBase64 } from "@cosmjs/encoding";
import {
  Account,
  Namada,
  AccountMsgValue,
  IbcTransferMsgValue,
  IbcTransferProps,
  InitAccountProps,
  Message,
  Signer as ISigner,
  TransferMsgValue,
  TransferProps,
  AccountType,
  SubmitBondProps,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitWithdrawMsgValue,
} from "@namada/types";
import { ApproveWithdrawMsg } from "./messages";

export class Signer implements ISigner {
  constructor(
    protected readonly chainId: string,
    private readonly _namada: Namada
  ) {}

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._namada.accounts(this.chainId))?.map(
      ({ alias, address, chainId, type, publicKey }) => ({
        alias,
        address,
        chainId,
        type,
        publicKey,
        isShielded: type === AccountType.ShieldedKeys,
      })
    );
  }

  /**
   * Submit bond transaction
   */
  public async submitBond(
    args: SubmitBondProps,
    type: AccountType
  ): Promise<void> {
    const msgValue = new SubmitBondMsgValue(args);
    const msg = new Message<SubmitBondMsgValue>();
    const encoded = msg.encode(msgValue);

    return await this._namada.submitBond({
      txMsg: toBase64(encoded),
      type,
    });
  }

  /**
   * Submit unbond transaction
   */
  public async submitUnbond(
    args: SubmitBondProps,
    type: AccountType
  ): Promise<void> {
    const msgValue = new SubmitUnbondMsgValue(args);
    const msg = new Message<SubmitUnbondMsgValue>();
    const encoded = msg.encode(msgValue);

    return await this._namada.submitUnbond({ txMsg: toBase64(encoded), type });
  }

  /**
   * Submit withdraw transaction
   */
  public async submitWithdraw(
    args: SubmitBondProps,
    type: AccountType
  ): Promise<void> {
    const msgValue = new SubmitWithdrawMsgValue(args);
    const msg = new Message<SubmitWithdrawMsgValue>();
    const encoded = msg.encode(msgValue);

    return await this._namada.submitWithdraw({
      txMsg: toBase64(encoded),
      type,
    });
  }

  /**
   * Submit a transfer
   */
  public async submitTransfer(
    args: TransferProps,
    type: AccountType
  ): Promise<void> {
    const transferMsgValue = new TransferMsgValue(args);
    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(transferMsgValue);

    return await this._namada.submitTransfer({
      txMsg: toBase64(serializedTransfer),
      type,
    });
  }

  /**
   * Submit an ibc transfer
   */
  public async submitIbcTransfer(args: IbcTransferProps): Promise<void> {
    const ibcTransferMsgValue = new IbcTransferMsgValue(args);
    const ibcTransferMessage = new Message<IbcTransferMsgValue>();
    const serializedIbcTransfer =
      ibcTransferMessage.encode(ibcTransferMsgValue);

    return await this._namada.submitIbcTransfer(
      toBase64(serializedIbcTransfer)
    );
  }

  /**
   * Encode an InitAccount message
   */
  public async encodeInitAccount(
    args: InitAccountProps,
    signer: string
  ): Promise<string | undefined> {
    const { vpCode } = args;
    const accountMsgValue = new AccountMsgValue({
      vpCode,
    });
    const accountMessage = new Message<AccountMsgValue>();
    const serialized = accountMessage.encode(accountMsgValue);

    return await this._namada.encodeInitAccount({
      txMsg: toBase64(serialized),
      address: signer,
    });
  }
}
