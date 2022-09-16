import { Account, IbcTransfer, Transfer } from "../shared/shared";

const source =
  "atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4";
const target =
  "atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw";
const secret =
  "1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93";
const token =
  "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
const epoch = 5;
const feeAmount = 1000;
const gasLimit = 1_000_000;
const amount = 100;

const vpCode = new Uint8Array([]);
const txCode = new Uint8Array([]);

describe("Account", () => {
  test("It should create valid hash and bytes", () => {
    const account = new Account(secret, vpCode);
    const { hash, bytes } = account.to_tx(
      secret,
      token,
      epoch,
      feeAmount,
      gasLimit,
      txCode
    );

    expect(hash).toBeDefined();
    expect(bytes).toBeDefined();
  });
});

describe("IbcTransfer", () => {
  test("It should create valid hash and bytes", () => {
    const port = "transfer";
    const channel = "channel-0";

    const ibcTransfer = new IbcTransfer(
      port,
      channel,
      token,
      source,
      target,
      amount
    );
    const { hash, bytes } = ibcTransfer.to_tx(
      secret,
      epoch,
      feeAmount,
      gasLimit,
      txCode
    );

    expect(hash).toBeDefined();
    expect(bytes).toBeDefined();
  });
});

describe("Transfer", () => {
  test("It should create valid hash and bytes", () => {
    const transfer = new Transfer(source, target, token, amount);
    const { hash, bytes } = transfer.to_tx(
      secret,
      epoch,
      feeAmount,
      gasLimit,
      txCode
    );

    expect(hash).toBeDefined();
    expect(bytes).toBeDefined();
  });
});
