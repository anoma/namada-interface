import init, {
  Address,
  Keypair,
  Transfer,
  Account,
  verify_signature,
  sign,
  generate_mnemonic,
} from "lib/anoma";

class AnomaClient {
  public memory: WebAssembly.Memory | null = null;

  // Imported Structs
  public readonly address = Address;
  public readonly keypair = Keypair;
  public readonly transfer = Transfer;
  public readonly account = Account;

  // Imported Methods
  public readonly verifySignature = verify_signature;
  public readonly sign = sign;
  public readonly generateMnemonic = generate_mnemonic;

  public async init(): Promise<AnomaClient> {
    const _init = typeof init === "function" ? init : null;
    if (_init) {
      const { memory } = await _init.apply(null);
      this.memory = memory;
    }
    return this;
  }
}

export default AnomaClient;
