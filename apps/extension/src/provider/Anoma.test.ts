import { deepMock } from "mockzilla";
import type { Browser } from "webextension-polyfill";

import { KVKeys } from "router";
import { init } from "test/init";
import { chains as defaultChains } from "../config";
import { chain, keyStore } from "./data.mock";
import { KEYSTORE_KEY } from "background/keyring";

// Needed for now as utils import webextension-polyfill directly
const [browser] = deepMock<Browser>(
  "browser",
  false
);
jest.mock("webextension-polyfill", () => browser);

describe("Anoma", () => {
  const { anoma, iDBStore } = init();

  it("should return chain by chainId", async () => {
    iDBStore.set(KVKeys.Chains, [chain]);
    const storedChain = await anoma.chain(chain.chainId);

    expect(storedChain).toEqual(chain);
  });

  it("should return all chains", async () => {
    iDBStore.set(KVKeys.Chains, [chain]);
    const storedChains = await anoma.chains();

    expect(storedChains).toEqual([...defaultChains, chain]);
  });

  it("should return all accounts", async () => {
    iDBStore.set(KEYSTORE_KEY, [keyStore]);
    const {crypto: _, ...storedKeyStore} = keyStore;

    const storedAccounts = await anoma.accounts(chain.chainId);

    expect(storedAccounts).toEqual([storedKeyStore]);
  });

  it("should add a chain configuration", async () => {
    await anoma.suggestChain(chain);

    const chains = await iDBStore.get('chains');
    expect(chains?.pop()).toEqual(chain);
  });
});

