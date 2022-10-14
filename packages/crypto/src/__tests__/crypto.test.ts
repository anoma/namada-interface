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
} from "../crypto/crypto";

const KEY_LENGTH = 32;
const SEED_LENGTH = 64;

describe("Mnemonic", () => {
  test("It should return the correct number of words", () => {
    let mnemonic = new Mnemonic(PhraseSize.N12);
    let words = mnemonic?.to_words();
    expect(words.length).toBe(12);

    mnemonic = new Mnemonic(PhraseSize.N12);
    words = mnemonic.to_words();

    expect(words.length).toBe(24);
  });

  test("It should return a seed with a valid length", () => {
    const mnemonic = new Mnemonic(PhraseSize.N12);
    const seed = mnemonic.to_seed();

    expect(seed.length).toBe(SEED_LENGTH);
  });
});

describe("HDWallet", () => {
  test("It should derive unique keys from a seed and a path", () => {
    const m = new Mnemonic(PhraseSize.N12);
    const seed = m.to_seed();
    const b = new HDWallet(seed);

    const account1 = b.derive("m/44/0/0/0");

    expect(account1.private().to_bytes().length).toBe(KEY_LENGTH);
    expect(account1.public().to_bytes().length).toBe(KEY_LENGTH);

    const account2 = b.derive("m/44/0/0/1");

    expect(account2.private().to_hex()).not.toBe(account1.private().to_hex());
    expect(account2.public().to_hex()).not.toBe(account1.public().to_hex());
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
