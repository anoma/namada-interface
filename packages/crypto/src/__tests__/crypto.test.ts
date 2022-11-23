import {
  AEAD,
  AES,
  Argon2,
  Argon2Params,
  ByteSize,
  HDWallet,
  Mnemonic,
  PhraseSize,
  Rng,
  Salt,
  Scrypt,
  ScryptParams,
  ShieldedHDWallet,
} from "../crypto/crypto";

const KEY_LENGTH = 32;
const SEED_LENGTH = 64;
const SHIELDED_KEY_LENGTH = 96;
const MNEMONIC_WORDS = [
  "odor",
  "panic",
  "bar",
  "rotate",
  "answer",
  "settle",
  "champion",
  "act",
  "excite",
  "family",
  "arrow",
  "season",
];

describe("Mnemonic", () => {
  test("It should return the correct number of words", () => {
    let mnemonic = new Mnemonic(PhraseSize.N12);
    let words = mnemonic?.to_words();
    expect(words.length).toBe(12);

    mnemonic = new Mnemonic(PhraseSize.N24);
    words = mnemonic.to_words();

    expect(words.length).toBe(24);
  });

  test("It should return a seed with a valid length", () => {
    const mnemonic12 = new Mnemonic(PhraseSize.N12);
    const seed = mnemonic12.to_seed();
    const mnemonic24 = new Mnemonic(PhraseSize.N24);
    const seed2 = mnemonic24.to_seed();

    expect(seed.length).toBe(SEED_LENGTH);
    expect(seed2.length).toBe(SEED_LENGTH);
  });
});

describe("HDWallet", () => {
  test("It should restore keys from a mnemonic and a path", () => {
    const m = Mnemonic.from_phrase(MNEMONIC_WORDS.join(" "));
    const seed = m.to_seed();
    const b = new HDWallet(seed);

    // /44' - Purpose
    // /1' - Testnet (all tokens)
    // /0' - Account 0'
    // /0 - Change (External)
    const rootPath = "m/44'/1'/0'/0";
    const root = b.derive(rootPath);
    const expectedRootPk =
      "e97a9774b7102c139e778a3793c748660512f9f03a0cd2cef8f4181fd9bcd933";
    const expectedRootPub =
      "86ec1457c9eedcb469fc2d381d5e20215abade64f41f061aca2bf93d445ad31a";

    expect(root.private().to_bytes().length).toBe(KEY_LENGTH);
    expect(root.public().to_bytes().length).toBe(KEY_LENGTH);
    expect(root.private().to_hex()).toBe(expectedRootPk);
    expect(root.public().to_hex()).toBe(expectedRootPub);

    // Account 1: m/44'/1'/0'/0/0
    const account1 = b.derive(`${rootPath}/0`);
    const expectedAccount1Pk =
      "f90691f142f5a967ade596645aec7924275f3a06978cb832e2fc80e4627fccaa";
    const expectedAccount1Pub =
      "68eacaf3518adb1f9e3c7669a495893615d0c47a748c25b462302817ca3fff39";

    expect(account1.private().to_bytes().length).toBe(KEY_LENGTH);
    expect(account1.public().to_bytes().length).toBe(KEY_LENGTH);
    expect(account1.private().to_hex()).toBe(expectedAccount1Pk);
    expect(account1.public().to_hex()).toBe(expectedAccount1Pub);

    // Account2: m/44'/1'/0'/0/1
    const account2 = b.derive(`${rootPath}/1`);
    const expectedAccount2Pk =
      "a3e35ef25a2a90f7d8d9f0e4db679d5099ff0992dc1735c7ef4027a6220f934b";
    const expectedAccount2Pub =
      "f99b467f2d4f3a59ccab3d86bd9c62436959687655cff56a393a88f70f49434d";
    expect(account2.private().to_bytes().length).toBe(KEY_LENGTH);
    expect(account2.public().to_bytes().length).toBe(KEY_LENGTH);
    expect(account2.private().to_hex()).toBe(expectedAccount2Pk);
    expect(account2.public().to_hex()).toBe(expectedAccount2Pub);
  });
});

describe("ShieldedHDWallet", () => {
  test("It should restore keys from a mnemonic and child indices", () => {
    const m = Mnemonic.from_phrase(MNEMONIC_WORDS.join(" "));
    const seed = m.to_seed();
    const b = new ShieldedHDWallet(seed);

    const master = b.master_keys();
    const account1 = b.derive(1);
    const account2 = b.derive(2);

    expect(master.expsk().length).toBe(SHIELDED_KEY_LENGTH);
    expect(master.fvk().length).toBe(SHIELDED_KEY_LENGTH);
    expect(account1.expsk().length).toBe(SHIELDED_KEY_LENGTH);
    expect(account1.fvk().length).toBe(SHIELDED_KEY_LENGTH);
    expect(master.expsk()).not.toEqual(account1.expsk());
    expect(account1.expsk()).not.toEqual(account2.expsk());
    expect(account1.fvk()).not.toEqual(account2.fvk());
  });
});

describe("AEAD", () => {
  test("It should encrypt and decrypt a value", () => {
    const password = "password";
    const message = "My secret message";
    const encrypted = AEAD.encrypt(message, password);
    const decrypted = AEAD.decrypt(encrypted, password);

    expect(decrypted).toBe(message);
  });
});

describe("Scrypt", () => {
  test("It should hash a password and verify with default params", () => {
    const password = "password";
    const scrypt = new Scrypt(password);
    const hash = scrypt.to_hash();
    const results = scrypt.verify(hash);

    expect(results).not.toBe("invalid password");
  });

  test("It should hash a password and verify with custom params", () => {
    const password = "password";
    const params = new ScryptParams(12, 12, 2);
    const scrypt = new Scrypt(password, undefined, params);
    const hash = scrypt.to_hash();
    const results = scrypt.verify(hash);

    expect(results).not.toBe("invalid password");
  });
});

describe("Argon2", () => {
  test("It should hash a password and verify with default params", () => {
    const password = "password";
    const argon2 = new Argon2(password);
    const hash = argon2.to_hash();
    const results = argon2.verify(hash);

    expect(results).not.toBe("invalid password");
  });

  test("It should hash a password and verify with custom params", () => {
    const password = "password";
    const params = new Argon2Params(2048, 2, 2);
    const salt = "41oVKhMIBZ+oF4efwq7e0A";
    const argon2 = new Argon2(password, salt, params);
    const hash = argon2.to_hash();
    const results = argon2.verify(hash);

    expect(results).not.toBe("invalid password");
  });
});

describe("AES", () => {
  test("It should encrypt and decrypt with provided key (Argon2) and iv", () => {
    const password = "password";
    const plaintext = "my secret message";
    const salt = Salt.generate().as_string();
    const argon2 = new Argon2(password, salt);
    const { params, key } = argon2.to_serialized();

    const iv = Rng.generate_bytes(ByteSize.N12);
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(plaintext);

    // Let's rehash a provided password, salt, and Argon2 parameters
    // to confirm that we can reconstruct the key originally used to encrypt:
    const { m_cost, t_cost, p_cost } = params;
    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const { key: newKey } = new Argon2(
      password,
      salt,
      argon2Params
    ).to_serialized();

    const aes2 = new AES(newKey, iv);
    const decrypted = aes2.decrypt(encrypted);
    const plaintextBytes = new Uint8Array(Buffer.from(plaintext));
    const decryptedText = new TextDecoder().decode(decrypted);

    expect(decrypted).toEqual(plaintextBytes);
    expect(decryptedText).toEqual(plaintext);
  });

  test("It should encrypt and decrypt with provided key (Scrypt) and iv", () => {
    const password = "password";
    const plaintext = "my secret message";
    const salt = Salt.generate().as_string();
    const scrypt = new Scrypt(password, salt);
    const { params, key } = scrypt.to_serialized();

    const iv = Rng.generate_bytes(ByteSize.N12);
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(plaintext);

    // Let's rehash a provided password, salt, and Scrypt parameters
    // to confirm that we can reconstruct the key originally used to encrypt:
    const { log_n, r, p } = params;
    const scryptParams = new ScryptParams(log_n, r, p);
    const { key: newKey } = new Scrypt(
      password,
      salt,
      scryptParams
    ).to_serialized();

    const aes2 = new AES(newKey, iv);
    const decrypted = aes2.decrypt(encrypted);
    const plaintextBytes = new Uint8Array(Buffer.from(plaintext));
    const decryptedText = new TextDecoder().decode(decrypted);

    expect(decrypted).toEqual(plaintextBytes);
    expect(decryptedText).toEqual(plaintext);
  });
});
