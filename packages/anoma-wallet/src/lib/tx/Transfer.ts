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
  }: {
    source: string;
    target: string;
    token: string;
    privateKey: string;
    epoch: number;
    amount: number;
  }): Promise<{ hash: string; bytes: Uint8Array }> {
    return await this._client?.transfer.new(
      privateKey, // Signing key
      source, // source address string
      target, // target address string
      token, // token address string
      amountToMicro(amount), // Amount is being sent in micro
      epoch, // Epoch
      0, // Gas limit multiplier
      0, // Fee amount
      this._txCode || new Uint8Array() // Transaction wasm
    );
  }
}

export default Transfer;
