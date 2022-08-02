import { ChainInfo } from "@keplr-wallet/types";
import { Chain } from "config";
import Keplr, { KeplrExtension } from "./Keplr";

const chain: Chain = {
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

const keplrExtension: KeplrExtension = {
  enable: async (id: string) => {
    if (id) {
      return;
    }
    return Promise.reject();
  },
  experimentalSuggestChain: async (chainInfo: ChainInfo) => {
    if (chainInfo) {
      return;
    }
    return Promise.reject();
  },
  getKey: async (id: string) => {
    if (id) {
      return {
        name: "keyName",
        algo: "algo",
        pubKey: new Uint8Array(),
        address: new Uint8Array(),
        bech32Address:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
      };
    }
    return Promise.reject();
  },
};

const keplr = new Keplr(chain, keplrExtension);

describe("Keplr class", () => {
  test("It should detect keplr extension", () => {
    const isKeplrDetected = keplr.detect();
    expect(isKeplrDetected).toEqual(true);
  });

  test("It should invoke suggestChain", async () => {
    const results = await keplr.suggestChain();
    expect(results).toEqual(true);
    // TODO: Properly mock window.keplr
    // expect(keplrExtension.experimentalSuggestChain).toHaveBeenCalled();
  });

  test("It should invoke enable", async () => {
    const results = await keplr.enable();
    expect(results).toEqual(true);
  });

  test("It should return a chain configuration for inspection", () => {
    const chainConfig = keplr.chain;
    expect(chainConfig).toBe(chain);
  });
});
