import { AccountType } from "@namada/types";
import { Result } from "@namada/utils";
import { KeyStore, KeyStoreType, VaultStorage } from "background/VaultStorage";
import { KVPrefix } from "router";
import { KVStoreMock } from "test/init";
import { VaultService } from "../service";
import { SessionPassword } from "../types";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;
jest.mock("webextension-polyfill", () => ({}));

type VaultPublicObj = { id: string; alias: string };
type VaultSensitiveValue = { bar: string };

const getKeyStore = (id: string, alias: string): KeyStoreType => ({
  id,
  alias,
  address: "address",
  owner: "owner",
  path: {
    account: 0,
    change: 0,
    index: 0,
  },
  type: AccountType.Mnemonic,
});

describe("Testing untouched Vault Service", () => {
  let service: VaultService;
  const keyString = "key-store";
  const password = "123foo";
  const secretText = "secret";

  beforeEach(async () => {
    const vaultStorage = new VaultStorage(new KVStoreMock(KVPrefix.IndexedDB));
    const sessionStore = new KVStoreMock<SessionPassword>(
      KVPrefix.SessionStorage
    );
    service = new VaultService(vaultStorage, sessionStore, cryptoMemory);
    await service.createPassword(password);
  });

  it("Should lock and unlock extension properly", async () => {
    // Should be unlocked after password creation
    expect(await service.isLocked()).toBeFalsy();

    await service.lock();
    expect(await service.isLocked()).toBeTruthy();
    await expect(service.assertIsUnlocked()).rejects.toThrow();
    await service.unlock(password);
    expect(await service.isLocked()).toBeFalsy();
    expect(await service.checkPassword(password)).toBeTruthy();
    expect(await service.UNSAFE_getPassword()).toEqual(
      await service.hashPassword(password)
    );
  });

  it("Should encrypt and decrypt message correctly", async () => {
    const sensitiveData = secretText;
    const publicData = getKeyStore("id", "alias");

    await service.assertIsUnlocked();
    await service.add<VaultSensitiveValue, typeof KeyStore>(
      KeyStore,
      publicData,
      {
        bar: sensitiveData,
      }
    );

    const vaultData = await service.findOneOrFail(
      KeyStore,
      "alias",
      publicData.alias
    );

    const output = await service.reveal<VaultSensitiveValue, typeof KeyStore>(
      vaultData
    );
    expect(output?.bar).toEqual(sensitiveData);
  });

  const addFakeData = async (): Promise<VaultPublicObj[]> => {
    const sensitiveData = { bar: secretText };
    const data = [
      { id: "key0", alias: "value0" },
      { id: "key1", alias: "value1" },
      { id: "key2", alias: "value2" },
    ].map((obj) => getKeyStore(obj.id, obj.alias));

    for (const obj of data) {
      await service.add<VaultSensitiveValue, typeof KeyStore>(
        KeyStore,
        obj,
        sensitiveData
      );
    }

    return data;
  };

  it("Should manage data correctly", async () => {
    await service.assertIsUnlocked();
    const data = await addFakeData();

    expect(await service.getLength(keyString)).toBe(data.length);
    expect(await service.findOne(KeyStore, "id", "key0")).toHaveProperty(
      "public.alias",
      "value0"
    );
    expect(await service.findOne(KeyStore, "id", "key1")).toHaveProperty(
      "public.alias",
      "value1"
    );
    expect(await service.findOneOrFail(KeyStore, "id", "key0")).toHaveProperty(
      "public.alias",
      "value0"
    );

    expect(await service.findOne(KeyStore, "id", "ops")).toBeNull();
    expect(await service.findAll(KeyStore)).toHaveLength(3);

    const query1 = await service.findAll(KeyStore, "id", "key1");
    expect(query1).toHaveLength(1);
    expect(query1[0]).toHaveProperty("public.alias", "value1");

    const query2 = await service.findAllOrFail(KeyStore, "id", "key1");
    expect(query2).toHaveLength(1);
  });

  it("Should re-encrypt data correctly", async () => {
    await service.assertIsUnlocked();
    await addFakeData();

    const newPassword = "321bar";
    const status = await service.resetPassword(password, newPassword);
    expect(status).toEqual(Result.ok(null));

    await service.lock();
    expect(await service.unlock(newPassword)).toBeTruthy();
    const data = await service.findAll(KeyStore);
    expect(data).toHaveLength(3);

    for (const obj of data) {
      expect(
        await service.reveal<VaultSensitiveValue, typeof KeyStore>(obj)
      ).toHaveProperty("bar", secretText);
    }
  });
});
