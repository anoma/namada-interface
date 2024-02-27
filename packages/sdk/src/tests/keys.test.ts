import { ACCOUNT_1 as account1, MNEMONIC_1 as mnemonic1 } from "./data";
import { initSdk } from "./initSdk";

describe("Keys", () => {
  it("should derive keys from mnemonic phrase", async () => {
    const { keys } = await initSdk();

    const { address, publicKey, privateKey } =
      keys.deriveFromMnemonic(mnemonic1);

    expect(address).toBe(account1.address);
    expect(publicKey).toBe(account1.publicKey);
    expect(privateKey).toBe(account1.privateKey);
  });

  it("should derive keys from seed", async () => {
    const { keys, mnemonic } = await initSdk();
    // Generate a seed from a mnemonic phrase
    const seed = mnemonic.toSeed(mnemonic1);
    // Derive account from that seed
    const { address, publicKey, privateKey } = keys.deriveFromSeed(seed);

    expect(address).toBe(account1.address);
    expect(publicKey).toBe(account1.publicKey);
    expect(privateKey).toBe(account1.privateKey);
  });
});
