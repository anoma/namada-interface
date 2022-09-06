import { Anoma } from "./Anoma";
import { ChainConfig } from "@anoma/types";

describe("Anoma", () => {
  test("It adds a chain configuration", async () => {
    const version = "0.1.0";
    const chainId = "namada-test.XXXXXXXXXXXX";
    const config: ChainConfig = {
      chainId,
      rpc: "http://localhost:3000",
    };
    const anoma = new Anoma(version);
    const results = await anoma.addChain(config);
    const { chains } = anoma;

    expect(results).toEqual(true);
    expect(chains).toEqual([]);
  });
});
