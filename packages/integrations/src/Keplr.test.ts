/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from "jest-mock-extended";

import { Keplr as IKeplr, Key } from "@keplr-wallet/types";
import { AccountType, Chain } from "@namada/types";

import {
  AccountData,
  OfflineDirectSigner,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import Keplr from "./Keplr";

/**
 * Mock Chain configuration data
 */
const mockChain = mock<Chain>();
/**
 * Mock Keplr extension
 */
const mockKeplrExtension = mock<IKeplr>();

describe("Keplr class", () => {
  let keplr: Keplr;

  beforeEach(() => {
    keplr = new Keplr(mockChain);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("'instance' should return the instance of Keplr extension", () => {
    expect(keplr.instance).toBeUndefined();

    (keplr as any)._keplr = mockKeplrExtension;
    expect(keplr.instance).toBe(mockKeplrExtension);
  });

  test("'signer' should return offline signer if there is one", () => {
    const offlineSignerMock = mock<OfflineSigner & OfflineDirectSigner>();
    (keplr as any)._offlineSigner = offlineSignerMock;

    expect(keplr.signer()).toBe(offlineSignerMock);
  });

  test("'signer' should return offline signer from the extension if offline signer is not present and extension is initialized", () => {
    const offlineSignerMock = mock<OfflineSigner & OfflineDirectSigner>();
    (keplr as any)._keplr = mockKeplrExtension;

    const getOfflineSignerSpy = jest
      .spyOn(mockKeplrExtension, "getOfflineSigner")
      .mockReturnValue(offlineSignerMock as any);

    const signer = keplr.signer();

    expect(getOfflineSignerSpy).toBeCalledWith(mockChain.chainId);
    expect(signer).toBe(offlineSignerMock);
  });

  test("'signer' should throw an error when offlineSginer is not present and extension is not initialized", () => {
    expect(() => keplr.signer()).toThrow();
  });

  test("'detect' should call init and return value indicating if extension is initialized", () => {
    const initSpy = jest.spyOn(keplr as any, "init").mockReturnValue(undefined);

    const falseDetect = keplr.detect();
    expect(falseDetect).toEqual(false);

    (keplr as any)._keplr = mockKeplrExtension;
    const trueDetect = keplr.detect();
    expect(trueDetect).toEqual(true);

    expect(initSpy).toBeCalledTimes(2);
  });

  test("'connect' should enable extension of extension is initialized", async () => {
    (keplr as any)._keplr = mockKeplrExtension;

    const enableSpy = jest
      .spyOn(mockKeplrExtension, "enable")
      .mockResolvedValue();

    const result = await keplr.connect();
    expect(enableSpy).toHaveBeenCalled();
    expect(enableSpy).toHaveBeenCalledWith(mockChain.chainId);
    expect(result).toBeUndefined();
  });

  test("'connect' should reject the promise if Keplr extension instance is not present", async () => {
    await expect(keplr.connect()).rejects.toBeDefined();
  });

  test("'getKey' should return the promise with key if Keplr extension is initialized", async () => {
    const key = mock<Key>();
    (keplr as any)._keplr = mockKeplrExtension;

    const getKeySpy = jest
      .spyOn(mockKeplrExtension, "getKey")
      .mockResolvedValue(key);
    const result = await keplr.getKey();

    expect(getKeySpy).toHaveBeenCalled();
    expect(getKeySpy).toHaveBeenCalledWith(mockChain.chainId);
    expect(result).toEqual(key);
  });

  test("'getKey' should reject the promise if Keplr extension instance is not present", async () => {
    await expect(keplr.getKey()).rejects.toBeDefined();
  });

  test("'accounts' should return mapped accounts from the extension if extension is initialized", async () => {
    (keplr as any)._keplr = mockKeplrExtension;
    const aliases = ["a1", "a2", "a3"];
    const keplrAccounts = aliases.map<AccountData>((address) => ({
      address,
      algo: "secp256k1",
      pubkey: new Uint8Array(),
    }));
    const offlineSigner = mock<OfflineSigner & OfflineDirectSigner>();
    jest.spyOn(keplr, "signer").mockReturnValue(offlineSigner as any);
    jest.spyOn(offlineSigner, "getAccounts").mockResolvedValue(keplrAccounts);

    const accounts = await keplr.accounts();
    expect(keplr.signer).toBeCalled();
    expect(offlineSigner.getAccounts).toBeCalled();
    expect(accounts).toEqual(
      aliases.map((a) => ({
        alias: `${a}...${a}`,
        chainId: mockChain.chainId,
        address: a,
        type: AccountType.PrivateKey,
        isShielded: false,
        chainKey: mockChain.id,
      }))
    );
  });

  test("'accounts' should return reject the promise if extension is not initialized", async () => {
    await expect(keplr.accounts()).rejects.toBeDefined();
  });
});
