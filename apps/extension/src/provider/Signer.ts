import { toBase64 } from "@cosmjs/encoding";
import {
  Account,
  Anoma,
  AccountMsgValue,
  AccountMsgSchema,
  IbcTransferMsgSchema,
  IbcTransferMsgValue,
  IbcTransferProps,
  InitAccountProps,
  Message,
  SignedTx,
  Signer as ISigner,
  TransferMsgValue,
  TransferMsgSchema,
  TransactionMsgValue,
  TransactionMsgSchema,
  TransferProps,
  TxProps,
} from "@anoma/types";

export class Signer implements ISigner {
  constructor(
    protected readonly chainId: string,
    private readonly _anoma: Anoma
  ) {}

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._anoma.accounts(this.chainId))?.map((account) => ({
      alias: account.alias,
      address: account.address,
    }));
  }

  /**
   * Sign encoded transaction message, returning Tx hash and bytes
   */
  public async signTx(
    signer: string,
    txProps: TxProps,
    txData: string
  ): Promise<SignedTx | undefined> {
    // TODO: Implement this._anoma.signTx(signer, txProps, encoded)
    const txMsg = new Message<TransactionMsgValue>();
    const txMsgValue = new TransactionMsgValue(txProps);
    const txMsgEncoded = txMsg.encode(TransactionMsgSchema, txMsgValue);

    return await this._anoma.signTx({
      signer,
      txMsg: toBase64(txMsgEncoded),
      txData,
    });
  }

  /**
   * Encode a Transfer message
   */
  public async encodeTransfer(
    args: TransferProps
  ): Promise<string | undefined> {
    const { source, target, token, amount } = args;
    const transferMsgValue = new TransferMsgValue({
      source,
      target,
      token,
      amount,
    });
    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      TransferMsgSchema,
      transferMsgValue
    );

    if (serializedTransfer) {
      return await this._anoma.encodeTransfer(toBase64(serializedTransfer));
    }
  }

  /**
   * Encode an IbcTransfer message
   */
  public async encodeIbcTransfer(
    args: IbcTransferProps
  ): Promise<string | undefined> {
    const { sourcePort, sourceChannel, token, sender, receiver, amount } = args;
    const ibcTransferMsgValue = new IbcTransferMsgValue({
      sourcePort,
      sourceChannel,
      token,
      sender,
      receiver,
      amount,
    });
    const ibcTransferMessage = new Message<IbcTransferMsgValue>();
    const serializedIbcTransfer = ibcTransferMessage.encode(
      IbcTransferMsgSchema,
      ibcTransferMsgValue
    );

    if (serializedIbcTransfer) {
      return await this._anoma.encodeTransfer(toBase64(serializedIbcTransfer));
    }
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

    if (serialized) {
      return await this._anoma.encodeInitAccount({
        txMsg: toBase64(serialized),
        address: signer,
      });
    }
  }
}
