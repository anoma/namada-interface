import {
  Anoma,
  AccountMsgValue,
  AccountMsgSchema,
  IbcTransferMsgValue,
  IbcTransferMsgSchema,
  IbcTransferProps,
  InitAccountProps,
  Message,
  TransferMsgValue,
  TransferMsgSchema,
  TransferProps,
  TxProps,
  SignedTx,
} from "@anoma/types";
import { DerivedAccount } from "types";

export interface ISigner<T> {
  accounts: () => Promise<T[]>;
  signTransfer(
    signer: string,
    args: TransferProps,
    txProps: TxProps
  ): Promise<SignedTx>;
  signIbcTransfer(
    signer: string,
    args: IbcTransferProps,
    txProps: TxProps
  ): Promise<SignedTx>;
  signInitAccount(
    signer: string,
    args: InitAccountProps,
    txProps: TxProps
  ): Promise<SignedTx>;
}

export class Signer<T = DerivedAccount> implements ISigner<T> {
  constructor(
    protected readonly chainId: string,
    protected readonly anoma: Anoma
  ) {}

  public async accounts(): Promise<T[]> {
    // TODO: Implement this.anoma.accounts()
    return [] as T[];
  }

  public async signTransfer(
    signer: string,
    args: TransferProps,
    txProps: TxProps
  ): Promise<SignedTx> {
    const { source, target, token, amount } = args;
    const transferMsgValue = new TransferMsgValue({
      source,
      target,
      token,
      amount,
    });

    const transferMessage = new Message<TransferMsgValue>();
    const encoded = transferMessage.encode(TransferMsgSchema, transferMsgValue);

    // TODO: Submit encoded message to proxy
    // This is just a placeholder for now - replace with call to anoma.signTransfer:
    const results = await this.anoma.getSigner(this.chainId);
    console.debug({ signer, txProps, results, encoded });

    return {
      hash: "",
      bytes: new Uint8Array([]),
    };
  }

  public async signIbcTransfer(
    signer: string,
    args: IbcTransferProps,
    txProps: TxProps
  ): Promise<SignedTx> {
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
    const encoded = ibcTransferMessage.encode(
      IbcTransferMsgSchema,
      ibcTransferMsgValue
    );

    // TODO: Submit encoded message to proxy
    // This is just a placeholder for now - replace with call to anoma.signIbcTransfer:
    const results = await this.anoma.getSigner(this.chainId);
    console.debug({ signer, txProps, encoded, results });
    return {
      hash: "",
      bytes: new Uint8Array([]),
    };
  }

  public async signInitAccount(
    signer: string,
    args: InitAccountProps,
    txProps: TxProps
  ): Promise<SignedTx> {
    const { vpCode } = args;
    const accountMsgValue = new AccountMsgValue({
      vpCode,
    });
    const accountMessage = new Message<AccountMsgValue>();
    const encoded = accountMessage.encode(AccountMsgSchema, accountMsgValue);

    // TODO: Submit encoded message to proxy
    // This is just a placeholder for now - replace with call to anoma.signInitAccount:
    const results = await this.anoma.getSigner(this.chainId);
    console.debug({ signer, txProps, encoded, results });
    return {
      hash: "",
      bytes: new Uint8Array([]),
    };
  }
}
