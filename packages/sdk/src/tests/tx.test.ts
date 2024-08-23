import BigNumber from "bignumber.js";
import { MockServer } from "jest-mock-server";
import {
  ACCOUNT_1 as account1,
  ACCOUNT_2 as account2,
  CHAIN_ID as chainId,
  NATIVE_TOKEN as nativeToken,
} from "./data";
import { initSdk } from "./initSdk";

describe("Tx", () => {
  const server = new MockServer({ port: 27657 });
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => server.reset());

  // TODO: This isn't working. buildTransfer expects a response when it checks whether
  // source & target exist. This may apply to other transactions as well.
  it.skip("should build a transfer tx", async () => {
    // Mock response for RPC queries that validate that
    // source and target exist on chain
    const addressExistsRoute = server
      .all(/.*/)
      .mockImplementationOnce((ctx) => {
        ctx.status = 200;
        ctx.body = true;
      });

    const { tx } = initSdk();

    const txProps = {
      chainId,
      token: nativeToken,
      feeAmount: BigNumber(0.5),
      gasLimit: BigNumber(0.5),
      publicKey: account1.publicKey,
    };

    const transferProps = {
      source: account1.address,
      token: nativeToken,
      target: account2.address,
      amount: BigNumber(123),
    };

    const builtTx = await tx.buildTransparentTransfer(txProps, {
      data: [transferProps],
    });
    expect(tx).toBeDefined();

    const txBytes = builtTx.bytes;
    // TODO: Better test here, this is just a placeholder
    expect(txBytes.length).toEqual(1000);
    expect(addressExistsRoute).toHaveBeenCalledTimes(2);
  });
});
