import { KVPrefix } from "router";
import { KVStoreMock } from "test/init";
import { VaultService } from "../service";
import { SessionPassword, VaultStore } from "../types";
import { Result } from "@namada/utils";

/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;
jest.mock("webextension-polyfill", () => ({}));

type VaultPublicValue = { foo: string };
type VaultPublicObj = { id: string; value: string };
type VaultSensitiveValue = { bar: string };

describe("Testing untouched Vault Service", () => {
  let service: VaultService;
  const keyString = "key";
  const password = "123foo";
  const secretText = "secret";

  beforeEach(async () => {
    const iDBStore = new KVStoreMock<VaultStore>(KVPrefix.IndexedDB);
    const sessionStore = new KVStoreMock<SessionPassword>(
      KVPrefix.SessionStorage
    );
    service = new VaultService(iDBStore, sessionStore, cryptoMemory);
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
    const publicData = "public data";
    const sensitiveData = secretText;

    await service.assertIsUnlocked();
    await service.add<VaultPublicValue, VaultSensitiveValue>(
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

    const output = await service.reveal<VaultSensitiveValue>(vaultData);
    expect(output?.bar).toEqual(sensitiveData);
  });

  const addFakeData = async (): Promise<VaultPublicObj[]> => {
    const sensitiveData = { bar: secretText };
    const data = [
      { id: "key0", value: "value0" },
      { id: "key1", value: "value1" },
      { id: "key2", value: "value2" },
    ];

    for (const obj of data) {
      await service.add<VaultPublicObj, VaultSensitiveValue>(
        keyString,
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
    expect(await service.findOne(keyString, "id", "key0")).toHaveProperty(
      "public.value",
      "value0"
    );
    expect(await service.findOne(keyString, "id", "key1")).toHaveProperty(
      "public.value",
      "value1"
    );
    expect(await service.findOneOrFail(keyString, "id", "key0")).toHaveProperty(
      "public.value",
      "value0"
    );

    expect(await service.findOne(keyString, "id", "ops")).toBeNull();
    expect(await service.findAll(keyString)).toHaveLength(3);

    const query1 = await service.findAll(keyString, "id", "key1");
    expect(query1).toHaveLength(1);
    expect(query1[0]).toHaveProperty("public.value", "value1");

    const query2 = await service.findAllOrFail(keyString, "id", "key1");
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
    const data = await service.findAll(keyString);
    expect(data).toHaveLength(3);

    for (const obj of data) {
      expect(await service.reveal<VaultSensitiveValue>(obj)).toHaveProperty(
        "bar",
        secretText
      );
    }
  });
});
