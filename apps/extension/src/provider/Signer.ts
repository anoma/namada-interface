import { toBase64 } from "@cosmjs/encoding";
import {
  Account,
  Anoma,
  AccountMsgValue,
  AccountMsgSchema,
  SubmitIbcTransferMsgSchema,
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
  SubmitBondMsgSchema,
  SubmitTransferMsgSchema,
  SubmitUnbondMsgValue,
  SubmitUnbondMsgSchema,
} from "@anoma/types";

export class Signer implements ISigner {
  constructor(
    protected readonly chainId: string,
    private readonly _anoma: Anoma
  ) {}

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._anoma.accounts(this.chainId))?.map(
      ({ alias, address, chainId, type }) => ({
        alias,
        address,
        chainId,
        isShielded: type === AccountType.ShieldedKeys,
      })
    );
  }

  /**
   * Submit bond transaction
   */
  public async submitBond(args: SubmitBondProps): Promise<void> {
    const msgValue = new SubmitBondMsgValue(args);

    const msg = new Message<SubmitBondMsgValue>();
    const encoded = msg.encode(SubmitBondMsgSchema, msgValue);

    return await this._anoma.submitBond(toBase64(encoded));
  }

  /**
   * Submit unbond transaction
   */
  public async submitUnbond(args: SubmitBondProps): Promise<void> {
    const msgValue = new SubmitUnbondMsgValue(args);

    const msg = new Message<SubmitUnbondMsgValue>();
    const encoded = msg.encode(SubmitUnbondMsgSchema, msgValue);

    return await this._anoma.submitUnbond(toBase64(encoded));
  }

  /**
   * Submit a transfer
   */
  public async submitTransfer(args: TransferProps): Promise<void> {
    const transferMsgValue = new TransferMsgValue(args);
    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      SubmitTransferMsgSchema,
      transferMsgValue
    );

    return await this._anoma.submitTransfer(toBase64(serializedTransfer));
  }

  /**
   * Submit an ibc transfer
   */
  public async submitIbcTransfer(args: IbcTransferProps): Promise<void> {
    const ibcTransferMsgValue = new IbcTransferMsgValue(args);
    const ibcTransferMessage = new Message<IbcTransferMsgValue>();
    const serializedIbcTransfer = ibcTransferMessage.encode(
      SubmitIbcTransferMsgSchema,
      ibcTransferMsgValue
    );

    return await this._anoma.submitIbcTransfer(toBase64(serializedIbcTransfer));
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
    const serialized = accountMessage.encode(AccountMsgSchema, accountMsgValue);

    return await this._anoma.encodeInitAccount({
      txMsg: toBase64(serialized),
      address: signer,
    });
  }
}
