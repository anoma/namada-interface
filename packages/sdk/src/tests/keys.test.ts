import {
  ACCOUNT_1 as account1,
  MNEMONIC_1 as mnemonic1,
  MNEMONIC_2 as mnemonic2,
  SHIELDED_ACCOUNT_1 as shieldedAccount1,
  SHIELDED_ACCOUNT_2 as shieldedAccount2,
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
    const seed2 = mnemonic.toSeed(mnemonic2);

    const { address, viewingKey, spendingKey } =
      keys.deriveShieldedFromSeed(seed);

    expect(address).toBe(shieldedAccount1.paymentAddress);
    expect(viewingKey).toBe(shieldedAccount1.viewingKey);
    expect(spendingKey).toBe(shieldedAccount1.spendingKey);

    const {
      address: address2,
      viewingKey: viewingKey2,
      spendingKey: spendingKey2,
    } = keys.deriveShieldedFromSeed(seed2);

    expect(address2).toBe(shieldedAccount2.paymentAddress);
    expect(viewingKey2).toBe(shieldedAccount2.viewingKey);
    expect(spendingKey2).toBe(shieldedAccount2.spendingKey);
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
