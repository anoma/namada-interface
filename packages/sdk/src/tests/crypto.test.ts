import { CRYPTO_RECORD } from "./data";
import { initSdk } from "./initSdk";

const PASSWORD = "super secure";

describe("Crypto", () => {
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
