import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import Transfer from "./Transfer";

const TOKEN =
  "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp";
const SOURCE =
  "atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4";
const TARGET =
  "atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw";
const PRIVATE_KEY =
  "73BF20F71265056A1ACB3091272929C4FCBEF5DE60D1222428D6A99CEB4EBC21";
const PUBLIC_KEY =
  "A57281E1DD9FD39EC3E8A162A1643CA7C836C0F2DAE3BEF1412A3A61A2FDE1A7";

describe("Transfer wasm and class methods", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("Transfer should return a byte array and a hash", async () => {
    const client = await new Transfer().init();

    fetchMock.mockResponseOnce(() => {
      return Promise.resolve(
        JSON.stringify({
          arrayBuffer: Buffer.from(new Uint8Array([])),
        })
      );
    });

    const { hash, bytes } = await client.makeTransfer({
      amount: 1,
      epoch: 1,
      privateKey: PRIVATE_KEY,
      publicKey: PUBLIC_KEY,
      source: SOURCE,
      target: TARGET,
      token: TOKEN,
    });

    expect(hash.length).toBe(64);
    expect(bytes.length).toBe(605);
  });
});
