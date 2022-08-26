import Session from "./Session";

const STORAGE_KEY = "com.anoma.net::seed";

const MNEMONIC_12 =
  "caught pig embody hip goose like become worry face oval manual flame";
const SECRET = "unhackable";

let setItemSpy: jest.SpyInstance, getItemSpy: jest.SpyInstance;

describe("Session class", () => {
  beforeAll(() => {
    setItemSpy = jest
      .spyOn(global.Storage.prototype, "setItem")
      .mockImplementation((key: string, value: string) => ({ key, value }));
    getItemSpy = jest
      .spyOn(global.Storage.prototype, "getItem")
      .mockImplementation((key: string) => key);
  });

  afterAll(() => {
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  test.skip("It should set an encrypted storage value", async () => {
    await Session.setSeed(MNEMONIC_12, SECRET);
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      // Assert a base64 string of length 168
      expect.stringMatching(/^([a-zA-Z0-9\+\/\=]){168}$/)
    );
  });

  test.skip("It should return encrypted storage value for seed", async () => {
    // TODO: Capture and verify the returned value of Session.encryptedSeed()
    // window.localStorage.getItem() always returns undefined
    Session.encryptedSeed();
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });

  test.skip("It should get mnemonic from encrypted storage value", async () => {
    // TODO: This panics: RuntimeError: unreachable
    // window.localStorage.getItem() always returns undefined
    const mnemonic = await Session.getSeed(SECRET);
    expect(mnemonic).toEqual(MNEMONIC_12);
    expect(getItemSpy).toHaveBeenCalledTimes(1);
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
