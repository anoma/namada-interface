import { amountToMicro } from "utils/helpers";
import { AnomaClient } from "lib";
import { TxWasm } from "constants/";
import Keypair from "lib/Keypair";

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
    publicKey,
    privateKey,
    epoch,
    amount,
  }: {
    source: string;
    target: string;
    token: string;
    publicKey: string;
    privateKey: string;
    epoch: number;
    amount: number;
  }): Promise<{ hash: string; bytes: Uint8Array }> {
    // Generate a Keypair struct:
    const keypair = new Keypair({
      public: publicKey,
      private: privateKey,
    });

    const nativeKeypair = await keypair.toNativeKeypair();

    return await this._client?.transfer.new(
      nativeKeypair.serialize(), // Serialized Keypair
      source, // source address string
      target, // target address string
      token, // token address string
      amountToMicro(amount), // Amount is being sent in micro
      epoch, // Epoch
      0, // Gas limit multiplier
      0, // Fee amount
      this._txCode || new Uint8Array() // tx_transfer wasm byte array
    );
  }
}

export default Transfer;
