import { Crypto } from "../crypto";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;

describe("background/vault/crypto", () => {
  it("Should encrypt and decrypt a string using a given password", async () => {
    const crypto = new Crypto();
    const text = "Hello world";
    const password = "123foo";
    const cryptoParams = crypto.encrypt(text, password);
    const outputString = crypto.decrypt(cryptoParams, password, cryptoMemory);
    expect(outputString).toEqual(text);
  });
});
