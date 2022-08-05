import { LocalStorageKeys } from "App/types";
import Session from "./Session";

type Store = Record<string, string>;

const MNEMONIC_12 =
  "caught pig embody hip goose like become worry face oval manual flame";
const SECRET = "abcdefg12345";

const mockStore: Store = {};

describe("Session class", () => {
  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn(
      (key: string, value: string): void => {
        mockStore[key] = String(value);
      }
    );
    global.Storage.prototype.getItem = jest.fn(
      (key: string): string => mockStore[key]
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("It should set an encrypted storage value", async () => {
    const spy = jest.spyOn(window.localStorage, "setItem");
    await Session.setSeed(MNEMONIC_12, SECRET);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      LocalStorageKeys.MasterSeed,
      // Match base64 string of length 168
      expect.stringMatching(/^([a-zA-Z0-9\+\/\=]){168}$/)
    );
  });

  test.skip("It should get mnemonic from encrypted storage value", async () => {
    const spy = jest.spyOn(window.localStorage, "getItem");

    // TODO: This panics: RuntimeError: unreachable
    // window.localStorage.getItem() always returns undefined
    const mnemonic = await Session.getSeed(SECRET);
    expect(mnemonic).toEqual(MNEMONIC_12);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(LocalStorageKeys.MasterSeed);
  });

  test("It should return encrypted storage value for seed", async () => {
    const spy = jest.spyOn(window.localStorage, "getItem");
    // TODO: Capture and verify the returned value of Session.encryptedSeed()
    // window.localStorage.getItem() always returns undefined
    Session.encryptedSeed();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(LocalStorageKeys.MasterSeed);
  });
});
