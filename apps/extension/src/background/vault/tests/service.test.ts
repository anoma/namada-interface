import { KVPrefix } from "router";
import { KVStoreMock } from "test/init";
import { VaultService } from "../service";
import { VaultStore } from "../types";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;
jest.mock("webextension-polyfill", () => ({}));

type VaultPublicValue = { foo: string };
type VaultSensitiveVaule = { bar: string };

describe("Testing pristine Vault Service", () => {
  let service: VaultService;
  const keyString = "key";
  const password = "123foo";

  beforeEach(async () => {
    const iDBStore = new KVStoreMock<VaultStore>(KVPrefix.IndexedDB);
    service = new VaultService(iDBStore, cryptoMemory);
    await service.createPassword(password);
  });

  it("Should lock and unlock extension properly", async () => {
    await service.lock();
    expect(service.isLocked()).toBeTruthy();
    expect(() => service.assertIsUnlocked()).toThrow();
    await service.unlock(password);
    expect(service.isLocked()).toBeFalsy();
  });

  it("Should encrypt and decrypt message correctly", async () => {
    const publicData = "public data";
    const sensitiveData = "secret";

    service.assertIsUnlocked();
    await service.add<VaultPublicValue, VaultSensitiveVaule>(
      keyString,
      {
        foo: publicData,
      },
      { bar: sensitiveData }
    );

    const vaultData = await service.findOneOrFail<VaultPublicValue>(
      keyString,
      "foo",
      publicData
    );

    const output = await service.reveal<VaultSensitiveVaule>(vaultData);
    expect(output?.bar).toEqual(sensitiveData);
  });
});
