import { AnomaClient, Keypair as NativeKeypair } from "@namada-interface/anoma-lib";
import Keypair from "./Keypair";

const KEYPAIR = {
  secret: "F003E045C9943C35704F506B657FBA06B0A271E03E08B7BB7CEAF4FB5C2477F3",
  public: "572512A95B190D615B1987F7072572A64951AD50F4F97EF9DBB83545C46AE600",
};

const SERIALIZABLE_KEYPAIR = {
  public: new Uint8Array([
    87, 37, 18, 169, 91, 25, 13, 97, 91, 25, 135, 247, 7, 37, 114, 166, 73, 81,
    173, 80, 244, 249, 126, 249, 219, 184, 53, 69, 196, 106, 230, 0,
  ]),
  secret: new Uint8Array([
    240, 3, 224, 69, 201, 148, 60, 53, 112, 79, 80, 107, 101, 127, 186, 6, 176,
    162, 113, 224, 62, 8, 183, 187, 124, 234, 244, 251, 92, 36, 119, 243,
  ]),
};

// Pointer object properties:
const props = ["ptr"];

describe("Keypair wasm and class methods", () => {
  test("Keypair should be able to be serialized to a native type", async () => {
    const keypair = new Keypair(KEYPAIR);
    const nativeKeypair: NativeKeypair = await keypair.toNativeKeypair();

    expect(Object.keys(nativeKeypair)).toEqual(expect.arrayContaining(props));
    const jsValue = nativeKeypair.from_pointer_to_js_value();

    expect({
      secret: new Uint8Array(jsValue.secret),
      public: new Uint8Array(jsValue.public),
    }).toEqual(SERIALIZABLE_KEYPAIR);
    expect(nativeKeypair.to_bytes().length).toBe(64);
  });

  test("Keypair should be able to return a serializable keypair type", () => {
    const keypair = new Keypair(KEYPAIR);
    const { serializable } = keypair;
    expect(serializable).toEqual(SERIALIZABLE_KEYPAIR);
  });

  test("JS Data should be able to be deserialized to native Keypair type", async () => {
    // First, create a native Keypair (from wasm)
    const { keypair } = await new AnomaClient().init();

    // Now, we have access to the static method "deserialize"
    const deserialized = keypair.from_js_value_to_pointer(SERIALIZABLE_KEYPAIR);
    expect(Object.keys(deserialized)).toEqual(expect.arrayContaining(props));
  });
});
