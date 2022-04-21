import { amountToMicro } from "utils/helpers";
import { AnomaClient } from "@anoma-apps/anoma-lib";
import { TxWasm } from "constants/";

class Transfer {
  private _txCode: Uint8Array | undefined;
  private _client: AnomaClient | undefined;

  public async init(): Promise<Transfer> {
    const results = await fetch(`/wasm/${TxWasm.Transfer}`);
    const wasm = await results.arrayBuffer();
    this._txCode = new Uint8Array(wasm);
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
  }: {
    source: string;
    target: string;
    token: string;
    privateKey: string;
    epoch: number;
    amount: number;
    gasLimit?: number;
    feeAmount?: number;
  }): Promise<{ hash: string; bytes: Uint8Array }> {
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
}

export default Transfer;
