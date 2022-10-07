import {
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
  TransferProps,
  TxProps,
} from "@anoma/types";

export class Signer implements ISigner {
  constructor(
    protected readonly chainId: string,
    protected readonly anoma: Anoma
  ) {}

  public async accounts(): Promise<[]> {
    // TODO: Implement this.anoma.accounts()
    return [];
  }

  /**
   * Sign encoded transaction message, returning Tx hash and bytes
   */
  public async signTx(
    signer: string,
    txProps: TxProps,
    encoded: Uint8Array
  ): Promise<SignedTx> {
    // TODO: Implement this.anoma.signTx(signer, txProps, encoded)
    console.log({ signer, txProps, encoded });
    return {
      hash: "",
      bytes: new Uint8Array([]),
    };
  }

  /**
   * Encode a Transfer message
   */
  public encodeTransfer(args: TransferProps): Uint8Array {
    const { source, target, token, amount } = args;
    const transferMsgValue = new TransferMsgValue({
      source,
      target,
      token,
      amount,
    });
    const transferMessage = new Message<TransferMsgValue>();
    return transferMessage.encode(TransferMsgSchema, transferMsgValue);
  }

  /**
   * Encode an IbcTransfer message
   */
  public encodeIbcTransfer(args: IbcTransferProps): Uint8Array {
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
    return ibcTransferMessage.encode(IbcTransferMsgSchema, ibcTransferMsgValue);
  }

  /**
   * Encode an InitAccount message
   */
  public async encodeInitAccount(
    signer: string,
    args: InitAccountProps
  ): Promise<Uint8Array> {
    console.log({ signer });
    const { vpCode } = args;
    const accountMsgValue = new AccountMsgValue({
      vpCode,
    });
    const accountMessage = new Message<AccountMsgValue>();
    // TODO: Init-Account requires a secret when creating InitAccount struct.
    // Implement `this.anoma.initAccount(signer, encoded)`
    return accountMessage.encode(AccountMsgSchema, accountMsgValue);
  }
}
