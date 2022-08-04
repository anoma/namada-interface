import { ChainInfo, Key, Keplr as IKeplr } from "@keplr-wallet/types";
import { Chain } from "config";

import Keplr from "./Keplr";

type MockKeplr = Pick<
  IKeplr,
  "enable" | "getKey" | "experimentalSuggestChain" | "getOfflineSignerAuto"
>;

const KEPLR_ADDED_CHAINS = ["anoma-test.fd58c789bc11e6c6392"];

/**
 * Mock Chain configuration data
 */
const mockChain: Chain = {
  accountIndex: 0,
  alias: "Namada Testnet",
  id: "anoma-test.fd58c789bc11e6c6392",
  network: {
    protocol: "http",
    wsProtocol: "ws",
    url: "localhost",
    port: 26657,
  },
};

/**
 * Mock Keplr key results data
 */
const mockKey: Key = {
  name: "keyName",
  algo: "algo",
  pubKey: new Uint8Array(),
  address: new Uint8Array(),
  bech32Address: "cosmos1qjnyxraddqgzg91ezty2x3n5t31eur9dsxx4fp",
  isNanoLedger: false,
};

/**
 * Mock Chain Info data for Keplr suggest chain functionality
 */
const mockChainInfo: ChainInfo = {
  rpc: "http://localhost:26657",
  rest: "http://localhost:1317",
  chainId: "anoma-test.fd58c789bc11e6c6392",
  chainName: "Namada Testnet",
  stakeCurrency: {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
    coinGeckoId: "cosmos",
  },
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "namada",
    bech32PrefixAccPub: "namadapub",
    bech32PrefixValAddr: "namadavaloper",
    bech32PrefixValPub: "namadavaloperpub",
    bech32PrefixConsAddr: "namadavalcons",
    bech32PrefixConsPub: "namadavalconspub",
  },
  currencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
  ],
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
};

/**
 * Mock Keplr extension
 */
const mockKeplrExtension: MockKeplr = {
  enable: async (): Promise<void> => {
    return;
  },
  experimentalSuggestChain: async (): Promise<void> => {
    return;
  },
  getKey: async (): Promise<Key> => {
    return mockKey;
  },
  // We don't have types we can import for OfflineSigner, and we currently only want
  // to ensure an error is raised if the provided chainId doesn't match the
  // keplr instance, hence the following any:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOfflineSignerAuto: async (chainId: string): Promise<any> => {
    if (KEPLR_ADDED_CHAINS.indexOf(chainId) < 0) {
      throw new Error("Chain not found!");
    }
  },
};

const mockKeplr = new Keplr(mockChain, mockKeplrExtension as IKeplr);

describe("Keplr class", () => {
  test("It should detect keplr extension", () => {
    const isKeplrDetected = mockKeplr.detect();

    expect(isKeplrDetected).toEqual(true);
  });

  test("It should invoke suggestChain", async () => {
    const spy = mockKeplr.instance
      ? jest.spyOn(mockKeplr.instance, "experimentalSuggestChain")
      : null;
    const results = await mockKeplr.suggestChain();

    expect(results).toEqual(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockChainInfo);
    spy?.mockRestore();
  });

  test("It should invoke enable", async () => {
    const spy = mockKeplr.instance
      ? jest.spyOn(mockKeplr.instance, "enable")
      : null;
    const results = await mockKeplr.enable();

    expect(results).toEqual(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockChain.id);
    spy?.mockRestore();
  });

  test("It should invoke getKey", async () => {
    const spy = mockKeplr.instance
      ? jest.spyOn(mockKeplr.instance, "getKey")
      : null;
    const results = await mockKeplr.getKey();

    expect(results).toBe(mockKey);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockChain.id);
    spy?.mockRestore();
  });

  test("It should invoke detectChain", async () => {
    const spy = mockKeplr.instance
      ? jest.spyOn(mockKeplr.instance, "getOfflineSignerAuto")
      : null;
    const results = await mockKeplr.detectChain();

    expect(results).toEqual(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(mockChain.id);
    spy?.mockRestore();
  });

  test("It should catch raised error if chainId not found in detectChain", async () => {
    const invalidChain = { ...mockChain, id: "anoma-ibc-0.4.5b0d5e5569aa27fb" };
    const mockKeplrInvalidChainId = new Keplr(
      invalidChain,
      mockKeplrExtension as IKeplr
    );

    const spy = mockKeplrInvalidChainId.instance
      ? jest.spyOn(mockKeplrInvalidChainId.instance, "getOfflineSignerAuto")
      : null;

    const results = await mockKeplrInvalidChainId.detectChain();

    expect(results).toEqual(false);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(invalidChain.id);
    spy?.mockRestore();
  });

  test("It should return a chain configuration for inspection", () => {
    const chainConfig = mockKeplr.chain;
    expect(chainConfig).toBe(mockChain);
  });
});
