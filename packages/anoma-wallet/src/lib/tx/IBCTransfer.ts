import { amountToMicro } from "utils/helpers";
import { AnomaClient } from "@anoma-apps/anoma-lib";
import { TxWasm } from "constants/";

class IBCTransfer {
  private _txCode: Uint8Array | undefined;
  private _client: AnomaClient | undefined;

  public async init(): Promise<IBCTransfer> {
    const results = await fetch(`/wasm/${TxWasm.IBC}`);
    const wasm = await results.arrayBuffer();
    this._txCode = new Uint8Array(wasm);
    this._client = await new AnomaClient().init();
    return this;
  }

  public async makeIbcTransfer({
    source,
    target,
    token,
    privateKey,
    epoch,
    amount,
    gasLimit = 0,
    portId,
    channelId,
    feeAmount = 0,
  }: {
    source: string;
    target: string;
    token: string;
    privateKey: string;
    epoch: number;
    amount: number;
    gasLimit?: number;
    portId: string;
    channelId: string;
    feeAmount?: number;
  }): Promise<{ hash: string; bytes: Uint8Array }> {
    return await this._client?.ibcTransfer.new(
      privateKey, // Signing key
      source, // source address string
      target, // target address string
      token, // token address string
      amountToMicro(amount), // Amount is being sent in micro
      epoch, // Epoch
      gasLimit, // Gas limit multiplier
      feeAmount, // Fee amount
      portId,
      channelId,
      this._txCode || new Uint8Array() // Transaction wasm
    );
  }
}

export default IBCTransfer;
