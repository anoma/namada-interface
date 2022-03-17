import { Address, Keypair, Transfer, Account, Wallet } from "lib/anoma";
import { memory } from "./anoma/anoma_bg.wasm";

export enum ResultType {
  Ok = "Ok",
  Err = "Err",
}

export type Result<T> = {
  Ok: T;
  Err: string | undefined;
};

class AnomaClient {
  public memory: WebAssembly.Memory = memory;

  public readonly address = Address;
  public readonly keypair = Keypair;
  public readonly transfer = Transfer;
  public readonly account = Account;
  public readonly wallet = Wallet;

  public async init(): Promise<AnomaClient> {
    return this;
  }
}

export default AnomaClient;
