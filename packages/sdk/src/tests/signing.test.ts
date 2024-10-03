import {
  ACCOUNT_1 as account1,
  SIG_INVALID as invalidSignature,
  SIG_VALID as validSignature,
} from "./data";
import { initSdk } from "./initSdk";

describe("Signing", () => {
  it("should generate a signature", () => {
    const { signing } = initSdk();
    const result = signing.signArbitrary(
      account1.privateKey,
      JSON.stringify({ test: "test" })
    );
    const [hash, signature] = result;

    expect(hash).toBe(validSignature.hash);
    expect(signature).toBe(validSignature.signature);
  });

  it("should validate a signature", () => {
    const { signing } = initSdk();

    const result = signing.verifyArbitrary(
      account1.publicKey,
      validSignature.hash,
      validSignature.signature
    );

    expect(result).toBeUndefined();
  });

  it("should throw error when validating an invalid signature", () => {
    const { signing } = initSdk();

    const verify = (): void =>
      signing.verifyArbitrary(
        account1.publicKey,
        invalidSignature.hash,
        invalidSignature.signature
      );

    expect(verify).toThrow();
  });
});
