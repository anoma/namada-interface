import { PhraseSize } from "mnemonic";
import { MNEMONIC_1 as mnemonic1 } from "./data";
import { initSdk } from "./initSdk";

describe("mnemonic", () => {
  it("should generate a 12 word mnemonic phrase", async () => {
    const { mnemonic } = initSdk();
    const words = mnemonic.generate();
    expect(words.length).toEqual(12);
  });

  it("should generate a 24 word mnemonic phrase", async () => {
    const { mnemonic } = initSdk();
    const words = mnemonic.generate(PhraseSize.N24);
    expect(words.length).toEqual(24);
  });

  it("should generate a seed from mnemonic", () => {
    const { mnemonic } = initSdk();
    const seed = mnemonic.toSeed(mnemonic1);
    expect(seed).toBeDefined();
    expect(seed.length).toEqual(64);
  });
});
