import { amountToMicro } from "@anoma/utils";
import { AnomaClient } from "@anoma/shared";

type TransactionData = {
  source: string;
  target: string;
  token: string;
  privateKey: string;
  epoch: number;
  amount: number;
  gasLimit?: number;
  feeAmount?: number;
};

type ShieldedTransactionData = TransactionData & {
  shieldedTransaction: Uint8Array;
};

class Transfer {
  private _client: AnomaClient | undefined;

  constructor(private readonly _txCode: Uint8Array) {}

  public async init(): Promise<Transfer> {
    this._client = await new AnomaClient().init();
    return this;
  }

  public async makeTransfer({
    source,
    target,
    token,
    privateKey,
    epoch,
    amount,
    gasLimit = 0,
    feeAmount = 0,
  }: TransactionData): Promise<{ hash: string; bytes: Uint8Array }> {
    return await this._client?.transfer.new(
      privateKey, // Signing key
      source, // source address string
      target, // target address string
      token, // token address string
      amountToMicro(amount), // Amount is being sent in micro
      epoch, // Epoch
      gasLimit, // Gas limit multiplier
      feeAmount, // Fee amount
      this._txCode || new Uint8Array() // Transaction wasm
    );
  }

  // this creates a transfer from the passed in data.
  // returns 2 things:
  // 1. hash that is used to observe the inclusion of this transaction
  // 2. bytes that is the transaction, this is broadcasted to the ledger
  public async makeShieldedTransfer(
    shieldedTransactionDetails: ShieldedTransactionData
  ): Promise<{ hash: string; bytes: Uint8Array }> {
    // TODO
    // for now setting gasLimit and feeAmount to constant values
    const {
      source,
      target,
      token,
      privateKey,
      epoch,
      amount,
      shieldedTransaction,
      gasLimit = 0,
      feeAmount = 0,
    } = shieldedTransactionDetails;

    const hashAndBytes = await this._client?.transfer.new_shielded(
      privateKey, // Signing key
      source, // source address string
      target, // target address string
      token, // token address string
      amountToMicro(amount), // Amount is being sent in micro
      epoch, // Epoch
      gasLimit, // Gas limit multiplier
      feeAmount, // Fee amount
      this._txCode || new Uint8Array(), // Transaction wasm
      shieldedTransaction
    );

    return hashAndBytes;
  }
}

export default Transfer;
