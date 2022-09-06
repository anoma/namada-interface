/* eslint-disable */
import init, {
  Keypair,
  Transfer,
  IbcTransfer,
  Account,
  Wallet,
  Mnemonic,
} from "./lib/anoma";
/* eslint-enable */

export enum ResultType {
  Ok = "Ok",
  Err = "Err",
}

export type Result<T> = {
  Ok: T;
  Err: string | undefined;
};

class AnomaClient {
  public memory: WebAssembly.Memory | null = null;

  public readonly keypair = Keypair;
  public readonly transfer = Transfer;
  public readonly ibcTransfer = IbcTransfer;
  public readonly account = Account;
  public readonly wallet = Wallet;
  public readonly mnemonic = Mnemonic;

  public async init(): Promise<AnomaClient> {
    // Support setting wasm-pack target to "nodejs" (for testing)
    const _init =
      typeof init === "function"
        ? init
        : () => Promise.resolve({ memory: null });

    const { memory } = await _init();
    this.memory = memory;
    return this;
  }
}

export default AnomaClient;
