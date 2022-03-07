/* eslint-disable max-len */
import Keypair from "./Keypair";

const KEYPAIR = {
  secret: "F003E045C9943C35704F506B657FBA06B0A271E03E08B7BB7CEAF4FB5C2477F3",
  public: "572512A95B190D615B1987F7072572A64951AD50F4F97EF9DBB83545C46AE600",
};

describe("Keypair wasm and class methods", () => {
  test("Keypair should be able to be serialized to a native type", async () => {
    const keypair = new Keypair(KEYPAIR);
    const nativeKeypair = await keypair.toNativeKeypair();
    expect(nativeKeypair).toEqual({ ptr: 1245256 });
  });

  test("Keypair should be able to return a serializable keypair type", () => {
    const keypair = new Keypair(KEYPAIR);
    const { serializable } = keypair;
    expect(serializable).toEqual({
      public: new Uint8Array([
        87, 37, 18, 169, 91, 25, 13, 97, 91, 25, 135, 247, 7, 37, 114, 166, 73,
        81, 173, 80, 244, 249, 126, 249, 219, 184, 53, 69, 196, 106, 230, 0,
      ]),
      secret: new Uint8Array([
        240, 3, 224, 69, 201, 148, 60, 53, 112, 79, 80, 107, 101, 127, 186, 6,
        176, 162, 113, 224, 62, 8, 183, 187, 124, 234, 244, 251, 92, 36, 119,
        243,
      ]),
    });
  });
});
