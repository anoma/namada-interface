import { Anoma, ChainConfig } from "./Anoma";

describe("Anoma", () => {
  test("It adds a chain ID", async () => {
    const chainId = "namada-test.XXXXXXXXXXXX";
    const config: ChainConfig = {
      chainId,
      rpc: "http://localhost:3000",
    };
    const anoma = new Anoma();
    const results = await anoma.addChain(config);
    const { chains } = anoma;

    expect(results).toEqual(true);
    expect(chains).toEqual([chainId]);
  });
});
