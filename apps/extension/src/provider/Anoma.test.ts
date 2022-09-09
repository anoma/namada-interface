import { Anoma } from "./Anoma";
import { chain } from "./data.mock";

describe("Anoma", () => {
  test("It adds a chain configuration", async () => {
    const version = "0.1.0";
    const anoma = new Anoma(version);
    const results = await anoma.suggestChain(chain);
    const { chainId } = chain;

    expect(results).toEqual(chainId);
  });
});
