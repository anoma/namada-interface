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
  BondingMsgValue,
  TransferMsgValue,
  TransactionMsgValue,
  TransactionMsgSchema,
  TransferProps,
  TxProps,
  AccountType,
  BondingProps,
  BondingMsgSchema,
  SubmitBondProps,
  SubmitBondMsgValue,
  SubmitBondMsgSchema,
  SubmitTransferMsgSchema,
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
   * Sign encoded transaction message, returning Tx hash and bytes
   */
  public async signTx(
    signer: string,
    txProps: TxProps,
    txData: string
  ): Promise<SignedTx | undefined> {
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
   * Encode a Bonding message
   */
  public async encodeBonding(args: BondingProps): Promise<string | undefined> {
    const { validator, source, amount } = args;
    const msgValue = new BondingMsgValue({
      source,
      validator,
      amount,
    });

    const bondingMsg = new Message<BondingMsgValue>();
    const serializedTransfer = bondingMsg.encode(BondingMsgSchema, msgValue);

    return await this._anoma.encodeBonding(toBase64(serializedTransfer));
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
   * Encode a Transfer message
   */
  public async submitTransfer(args: TransferProps): Promise<void> {
    const {
      tx,
      source,
      target,
      token,
      subPrefix,
      amount,
      nativeToken,
      txCode,
    } = args;
    const transferMsgValue = new TransferMsgValue({
      tx,
      source,
      target,
      token,
      subPrefix,
      amount,
      nativeToken,
      txCode,
    });
    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      SubmitTransferMsgSchema,
      transferMsgValue
    );

    return await this._anoma.submitTransfer(toBase64(serializedTransfer));
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

    return await this._anoma.encodeIbcTransfer(toBase64(serializedIbcTransfer));
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

  /**
   * Encode an RevealPk message
   */
  public async encodeRevealPk(signer: string): Promise<string | undefined> {
    return await this._anoma.encodeRevealPk({
      signer,
    });
  }
}
