import init, { Address, Keypair, Transfer, Account, Wallet } from "lib/anoma";

// Utility enum for handling Result responses from wasm:
export enum Result {
  Ok = "Ok",
  Err = "Err",
}

class AnomaClient {
  public memory: WebAssembly.Memory | null = null;

  // Imported Structs
  public readonly address = Address;
  public readonly keypair = Keypair;
  public readonly transfer = Transfer;
  public readonly account = Account;
  public readonly wallet = Wallet;

  public async init(): Promise<AnomaClient> {
    const _init =
      typeof init === "function"
        ? init
        : () => Promise.resolve({ memory: null });
    const { memory } = await _init();
    this.memory = memory;

    return this;
  }
}

// Alias types to avoid conflicts with classes
export type AddressType = Address;
export type KeypairType = Keypair;
export type TransferType = Transfer;
export type AccountType = Account;
export type WalletType = Wallet;

export default AnomaClient;
