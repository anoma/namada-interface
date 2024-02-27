import { PhraseSize } from "@namada/crypto";
import { initSdk } from "./initSdk";

describe("mnemonic", () => {
  it("should generate a 12 word mnemonic phrase", async () => {
    const { mnemonic } = await initSdk();
    const words = await mnemonic.generate();
    expect(words.length).toEqual(12);
  });

  it("should generate a 24 word mnemonic phrase", async () => {
    const { mnemonic } = await initSdk();
    const words = await mnemonic.generate(PhraseSize.N24);
    expect(words.length).toEqual(24);
  });
});
