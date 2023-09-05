/* eslint-disable @typescript-eslint/no-explicit-any */
import { toBase64 } from "@cosmjs/encoding";

import { AccountMsgValue, Message, Chain, Namada } from "@namada/types";

import { KVKeys } from "router";
import { init, KVStoreMock } from "test/init";
import { chains as defaultChains } from "@namada/chains";
import { chain, keyStore, password, ACTIVE_ACCOUNT } from "./data.mock";
import {
  KeyRing,
  KeyRingService,
  KeyStore,
  KEYSTORE_KEY,
  PARENT_ACCOUNT_ID_KEY,
  UtilityStore,
} from "background/keyring";
import * as utils from "extension/utils";

// Needed for now as utils import webextension-polyfill directly
jest.mock("webextension-polyfill", () => ({}));

describe("Namada", () => {
  let namada: Namada;
  let iDBStore: KVStoreMock<Chain[] | KeyStore[]>;
  let utilityStore: KVStoreMock<UtilityStore>;
  let keyRingService: KeyRingService;

  beforeAll(async () => {
    jest.spyOn(utils, "getNamadaRouterId").mockResolvedValue(1);
    ({ namada, iDBStore, utilityStore, keyRingService } = await init());

    jest
      .spyOn(KeyRing.prototype, "checkPassword")
      .mockReturnValue(Promise.resolve(true));

    keyRingService.unlock(password);
  });

  afterAll(() => {
    keyRingService.lock();
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

  // This test shows that init account is NOT working - it is also unused.
  // We will have to change assertion after fixing initAccount fn
  it("should THROW AN ERROR on encode init account", async () => {
    const accountMsgValue = new AccountMsgValue({
      vpCode: new Uint8Array(),
    });
    const accountMessage = new Message<AccountMsgValue>();
    const serialized = accountMessage.encode(accountMsgValue);

    await expect(
      namada.encodeInitAccount({
        txMsg: toBase64(serialized),
        address: keyStore[0].address,
      })
    ).rejects.toThrow();
  });
});
