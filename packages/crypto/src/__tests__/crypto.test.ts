import {
  AES,
  Argon2,
  Argon2Params,
  ByteSize,
  HDWallet,
  Mnemonic,
  PhraseSize,
  Rng,
  Salt,
  ShieldedHDWallet,
} from "../crypto/crypto";

import {
  readStringPointer,
  readVecStringPointer,
  readVecU8Pointer,
} from "../utils";

// __wasm is not exported in crypto.d.ts so need to use require instead of import
const memory = require("../crypto/crypto").__wasm.memory;

const KEY_LENGTH = 32;
const SEED_LENGTH = 64;
const SHIELDED_CHILD_KEY_LENGTH = 169;
//odor panic bar rotate answer settle champion act excite family arrow season
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
    let words = readVecStringPointer(mnemonic?.to_words(), memory);
    expect(words.length).toBe(12);

    mnemonic = new Mnemonic(PhraseSize.N24);
    words = readVecStringPointer(mnemonic.to_words(), memory);

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
    const coinType = 877;

    // /44' - Purpose
    // /877' - Testnet (all tokens)
    // /0' - Account
    // /0 - Change
    // /0 - Index
    const defaultPath = new Uint32Array([44, coinType, 0, 0, 0]);
    const defaultKey = b.derive(defaultPath);
    const defaultSecretKey =
      "116758879874284ffd7aad6af14d3ec24e2744671c667368698daca294799921";

    expect(defaultKey.to_bytes().length).toBe(KEY_LENGTH);
    expect(readStringPointer(defaultKey.to_hex(), memory)).toBe(
      defaultSecretKey
    );

    // Account 1: m/44'/877'/0'/0/1
    const path1 = new Uint32Array([44, coinType, 0, 0, 1]);
    const account1 = b.derive(path1);
    const expectedAccount1Pk =
      "fb348813623581154f240243b27ad2b5c7ecdc46a550526244cbea3e99c95a4a";

    expect(account1.to_bytes().length).toBe(KEY_LENGTH);
    expect(readStringPointer(account1.to_hex(), memory)).toBe(
      expectedAccount1Pk
    );

    // Account 2: m/44'/877'/0'/0/2
    const path2 = new Uint32Array([44, coinType, 0, 0, 2]);
    const account2 = b.derive(path2);
    const expectedAccount2Pk =
      "fda60501d0ba451b08d42f433aa3fb4223801a8d7296953273b20c3a2d24a7a2";

    expect(account2.to_bytes().length).toBe(KEY_LENGTH);
    expect(readStringPointer(account2.to_hex(), memory)).toBe(
      expectedAccount2Pk
    );
  });
});

describe("ShieldedHDWallet", () => {
  test("It should restore keys from a mnemonic and child indices", () => {
    const m = Mnemonic.from_phrase(MNEMONIC_WORDS.join(" "));
    const seed = m.to_seed();
    const b = new ShieldedHDWallet(seed);

    const account1 = b.derive(new Uint32Array([32, 877, 0]));
    const account2 = b.derive(new Uint32Array([32, 877, 1]));

    expect(account1.xsk().length).toBe(SHIELDED_CHILD_KEY_LENGTH);
    expect(account1.xfvk().length).toBe(SHIELDED_CHILD_KEY_LENGTH);
    expect(account1.xsk()).not.toEqual(account2.xsk());
    expect(account1.xfvk()).not.toEqual(account2.xfvk());
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
    const params = argon2.params();
    const key = argon2.key();

    const iv = Rng.generate_bytes(ByteSize.N12);
    const aes = new AES(key, iv);
    const encrypted = aes.encrypt(plaintext);

    // Let's rehash a provided password, salt, and Argon2 parameters
    // to confirm that we can reconstruct the key originally used to encrypt:
    const { m_cost, t_cost, p_cost } = params;
    const argon2Params = new Argon2Params(m_cost, t_cost, p_cost);
    const newKey = new Argon2(password, salt, argon2Params).key();

    const aes2 = new AES(newKey, iv);
    const decrypted = readVecU8Pointer(aes2.decrypt(encrypted), memory);
    const plaintextBytes = new Uint8Array(Buffer.from(plaintext));
    const decryptedText = new TextDecoder().decode(decrypted);

    expect(decrypted).toEqual(plaintextBytes);
    expect(decryptedText).toEqual(plaintext);
  });
});
