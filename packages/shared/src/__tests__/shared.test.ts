import { Address, Account, IbcTransfer, Transfer } from "../shared/shared";

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

// Empty validity predicate code
const vpCode = new Uint8Array([]);
// Empty transaction code
const txCode = new Uint8Array([]);

const HASH_LENGTH = 64;

describe("Address", () => {
  test("It should generate an ImplicitAddress from a secret", () => {
    const address = new Address(secret);
    const implicit = address.implicit();

    expect(implicit).toBe("5162ABDCBABA0940AA25C9885DE79D088433EB9D");
  });

  test("It should generate a PublicKey from a secret", () => {
    const address = new Address(secret);
    const publicKey = address.public();
    const ed25519Key =
      "b7a3c12dc0c8c748ab07525b701122b88bd78f600c76342d27f25e5f92444cde";

    // PublicKey is padded with "00"
    expect(publicKey.substring(2)).toBe(ed25519Key);
  });

  test("It should generate a SecretKey from a secret", () => {
    const address = new Address(secret);
    const secretKey = address.private();

    // SecretKey is padded with "00"
    expect(secretKey.substring(2)).toBe(secret);
  });
});

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

    expect(hash.length).toEqual(HASH_LENGTH);
    // Assert that we get a byte array of the expected size
    expect(bytes.length).toEqual(489);
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

    expect(hash.length).toEqual(HASH_LENGTH);
    // Assert that we get a byte array of the expected size
    expect(bytes.length).toEqual(797);
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

    expect(hash.length).toEqual(HASH_LENGTH);
    // Assert that we get a byte array of the expected size
    expect(bytes.length).toEqual(596);
  });
});
