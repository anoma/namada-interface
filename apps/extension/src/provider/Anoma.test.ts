import { deepMock } from "mockzilla";
import { init } from "test/init";
import type { Browser } from "webextension-polyfill";

import { chain } from "./data.mock";

// Needed for now as utils import webextension-polyfill directly
const [browser] = deepMock<Browser>(
  "browser",
  false
);
jest.mock("webextension-polyfill", () => browser);

describe("Anoma", () => {
  const { anoma, chainStore } = init();

  test("It adds a chain configuration", async () => {
    await anoma.suggestChain(chain);

    const chains = await chainStore.get('chains');
    expect(chains?.pop()).toEqual(chain);
  });
});

