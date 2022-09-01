import { AnomaClient } from "@anoma/wasm";

class IBCTransfer {
  private _client: AnomaClient | undefined;

  constructor(private readonly _txCode: Uint8Array) {}

  public async init(): Promise<IBCTransfer> {
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
      amount, // Amount is being sent in micro
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
