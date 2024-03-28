import {
  ACCOUNT_1 as account1,
  MNEMONIC_1 as mnemonic1,
  SHIELDED_ACCOUNT as shieldedAccount,
} from "./data";
import { initSdk } from "./initSdk";

describe("Keys", () => {
  it("should derive transparent keys from mnemonic phrase", () => {
    const { keys } = initSdk();

    const { address, publicKey, privateKey } =
      keys.deriveFromMnemonic(mnemonic1);

    expect(address).toBe(account1.address);
    expect(publicKey).toBe(account1.publicKey);
    expect(privateKey).toBe(account1.privateKey);
  });

  it("should derive shielded keys from seed", () => {
    const { keys, mnemonic } = initSdk();
    const seed = mnemonic.toSeed(mnemonic1);

    const { address, viewingKey, spendingKey } =
      keys.deriveShieldedFromSeed(seed);

    expect(address).toBe(shieldedAccount.paymentAddress);
    expect(viewingKey).toBe(shieldedAccount.viewingKey);
    expect(spendingKey).toBe(shieldedAccount.spendingKey);
  });

  it("should derive keys from seed", () => {
    const { keys, mnemonic } = initSdk();
    // Generate a seed from a mnemonic phrase
    const seed = mnemonic.toSeed(mnemonic1);
    // Derive account from that seed
    const { address, publicKey, privateKey } = keys.deriveFromSeed(seed);

    expect(address).toBe(account1.address);
    expect(publicKey).toBe(account1.publicKey);
    expect(privateKey).toBe(account1.privateKey);
  });
});
