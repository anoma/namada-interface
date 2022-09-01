import Account from "./Account";

const TOKEN =
  "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp";
const PRIVATE_KEY =
  "73BF20F71265056A1ACB3091272929C4FCBEF5DE60D1222428D6A99CEB4EBC21";

describe("Account wasm and class methods", () => {
  test("Account initialization should return a byte array and a hash", async () => {
    const txWasm = new Uint8Array([]);
    const vpWasm = new Uint8Array([]);
    const client = await new Account(txWasm, vpWasm).init();
    const { hash, bytes } = await client.initialize({
      epoch: 1,
      privateKey: PRIVATE_KEY,
      token: TOKEN,
    });

    expect(hash.length).toBe(64);
    expect(bytes.length).toBe(489);
  });
});
