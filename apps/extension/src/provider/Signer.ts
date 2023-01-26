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
  TransferMsgSchema,
  TransactionMsgValue,
  TransactionMsgSchema,
  TransferProps,
  TxProps,
  AccountType,
  BondingProps,
  BondingMsgSchema,
  BondProps,
  BondMsgValue,
  BondMsgSchema,
  Tx,
  TxMsgValue,
  TxMsgSchema,
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
  public async submitBond(args: { bond: BondProps; tx: Tx }): Promise<void> {
    const msgValue1 = new BondMsgValue(args.bond);

    const msg1 = new Message<BondMsgValue>();
    const msg1encoded = msg1.encode(BondMsgSchema, msgValue1);

    const msgValue2 = new TxMsgValue(args.tx);

    const msg2 = new Message<TxMsgValue>();
    const msg2encoded = msg2.encode(TxMsgSchema, msgValue2);

    return await this._anoma.submitBond({
      txMsg1: toBase64(msg1encoded),
      txMsg2: toBase64(msg2encoded),
    });
  }

  /**
   * Encode a Transfer message
   */
  public async encodeTransfer(
    args: TransferProps
  ): Promise<string | undefined> {
    const { source, target, token, amount, key, shielded } = args;
    const transferMsgValue = new TransferMsgValue({
      source,
      target,
      token,
      amount,
      key,
      shielded,
    });
    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(
      TransferMsgSchema,
      transferMsgValue
    );

    return await this._anoma.encodeTransfer(toBase64(serializedTransfer));
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
