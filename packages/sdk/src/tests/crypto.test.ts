import { Argon2Config } from "../crypto";
import { CRYPTO_RECORD } from "./data";
import { initSdk } from "./initSdk";

const PASSWORD = "super secure";
const IV_LENGTH = 12;
const KEY_LENGTH = 43;
const SALT_LENGTH = 22;

describe("Crypto", () => {
  it("should construct encryption params", () => {
    const { crypto } = initSdk();
    const { params, iv, key, salt } = crypto.makeEncryptionParams(PASSWORD);

    expect(iv.length).toEqual(IV_LENGTH);
    expect(key.length).toEqual(KEY_LENGTH);
    expect(salt.length).toEqual(SALT_LENGTH);
    // Verify default values are used when no overrides were provided
    expect(params.m_cost).toStrictEqual(Argon2Config.m_cost);
    expect(params.p_cost).toStrictEqual(Argon2Config.p_cost);
    expect(params.t_cost).toStrictEqual(Argon2Config.t_cost);
  });

  it("should encrypt and decrypt data successfully", () => {
    const { crypto } = initSdk();
    const plainText = "This is sensitive data";
    const cryptoRecord = crypto.encrypt(plainText, PASSWORD);
    const decryptedData = crypto.decrypt(cryptoRecord, PASSWORD);

    expect(decryptedData).toBe(plainText);
  });

  it("should decrypt stored crypto record successfully", () => {
    const { crypto } = initSdk();
    const plainText = "This is sensitive data";
    const decryptedData = crypto.decrypt(CRYPTO_RECORD, PASSWORD);
    expect(decryptedData).toBe(plainText);
  });
});
