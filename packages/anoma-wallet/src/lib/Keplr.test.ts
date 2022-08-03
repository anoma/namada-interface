import { ChainInfo, Key } from "@keplr-wallet/types";
import { Chain } from "config";
import Keplr, { KeplrExtension } from "./Keplr";

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
  bech32Address:
    "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
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
const mockKeplrExtension: KeplrExtension = {
  enable: async (): Promise<void> => {
    return;
  },
  experimentalSuggestChain: async (): Promise<void> => {
    return;
  },
  getKey: async (): Promise<Key> => {
    return mockKey;
  },
};

const mockKeplr = new Keplr(mockChain, mockKeplrExtension);

describe("Keplr class", () => {
  test("It should detect keplr extension", () => {
    const isKeplrDetected = mockKeplr.detect();

    expect(isKeplrDetected).toEqual(true);
  });

  test("It should invoke suggestChain", async () => {
    const spy = jest.spyOn(mockKeplr.instance, "experimentalSuggestChain");
    const results = await mockKeplr.suggestChain();

    expect(results).toEqual(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockChainInfo);
  });

  test("It should invoke enable", async () => {
    const spy = jest.spyOn(mockKeplr.instance, "enable");
    const results = await mockKeplr.enable();

    expect(results).toEqual(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockChain.id);
  });

  test("It should invoke getKey", async () => {
    const spy = jest.spyOn(mockKeplr.instance, "getKey");
    const results = await mockKeplr.getKey();

    expect(results).toBe(mockKey);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockChain.id);
  });

  test("It should return a chain configuration for inspection", () => {
    const chainConfig = mockKeplr.chain;
    expect(chainConfig).toBe(mockChain);
  });
});
