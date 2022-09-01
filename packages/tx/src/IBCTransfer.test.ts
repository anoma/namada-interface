import IBCTransfer from "./IBCTransfer";

const TOKEN =
  "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp";
const SOURCE =
  "atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4";
const TARGET =
  "atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw";
const PRIVATE_KEY =
  "73BF20F71265056A1ACB3091272929C4FCBEF5DE60D1222428D6A99CEB4EBC21";
const CHANNEL_ID = "channel-0";
const PORT_ID = "transfer";

describe("IBCTransfer class", () => {
  test("IBCTransfer should return a byte array and a hash", async () => {
    const wasm = new Uint8Array([]);
    const client = await new IBCTransfer(wasm).init();
    const { hash, bytes } = await client.makeIbcTransfer({
      amount: 1,
      epoch: 1,
      privateKey: PRIVATE_KEY,
      source: SOURCE,
      target: TARGET,
      token: TOKEN,
      channelId: CHANNEL_ID,
      portId: PORT_ID,
    });

    expect(hash.length).toBe(64);
    expect(bytes.length).toBe(795);
  });
});
