/* eslint-disable @typescript-eslint/no-explicit-any */

import { Chain, Namada } from "@namada/types";

import { chains as defaultChains } from "@namada/chains";
import {
  KEYSTORE_KEY,
  PARENT_ACCOUNT_ID_KEY,
  UtilityStore,
} from "background/keyring";
import { KeyStore, VaultService } from "background/vault";
import * as utils from "extension/utils";
import { KVKeys } from "router";
import { init, KVStoreMock } from "test/init";
import { ACTIVE_ACCOUNT, chain, keyStore, password } from "./data.mock";
import { VaultStore } from "../background/vault/types";

// Needed for now as utils import webextension-polyfill directly
jest.mock("webextension-polyfill", () => ({}));

describe("Namada", () => {
  let namada: Namada;
  let iDBStore: KVStoreMock<Chain[] | KeyStore[] | VaultStore[]>;
  let utilityStore: KVStoreMock<UtilityStore>;
  let vaultService: VaultService;

  beforeAll(async () => {
    jest.spyOn(utils, "getNamadaRouterId").mockResolvedValue(1);
    ({ namada, iDBStore, utilityStore, vaultService } = await init());

    jest
      .spyOn(VaultService.prototype, "checkPassword")
      .mockReturnValue(Promise.resolve(true));

    vaultService.unlock(password);
  });

  afterAll(() => {
    vaultService.lock();
  });

  it("should return chain by chainId", async () => {
    iDBStore.set(KVKeys.Chains, [chain]);
    const storedChain = await namada.chain(chain.chainId);

    expect(storedChain).toEqual(chain);
  });

  it("should return all chains", async () => {
    iDBStore.set(KVKeys.Chains, [chain]);
    const storedChains = await namada.chains();

    expect(storedChains).toEqual([...Object.values(defaultChains), chain]);
  });

  it("should return all accounts", async () => {
    iDBStore.set(KEYSTORE_KEY, keyStore);
    utilityStore.set(PARENT_ACCOUNT_ID_KEY, ACTIVE_ACCOUNT);
    const storedKeyStore = keyStore.map(
      ({ crypto: _crypto, ...account }) => account
    );
    const storedAccounts = await namada.accounts(chain.chainId);

    expect(storedAccounts).toEqual(storedKeyStore);
  });

  it("should add a chain configuration", async () => {
    await namada.suggestChain(chain);

    const chains = await iDBStore.get("chains");
    expect(chains?.pop()).toEqual(chain);
  });
});
