import init, { Address, Keypair, Transfer, Account } from "lib/anoma";

class AnomaClient {
  public memory: WebAssembly.Memory | null = null;

  // Imported Structs
  public readonly address = Address;
  public readonly keypair = Keypair;
  public readonly transfer = Transfer;
  public readonly account = Account;

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

export default AnomaClient;
