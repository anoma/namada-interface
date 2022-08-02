import { ChainInfo } from "@keplr-wallet/types";

import { Chain } from "config";
import { Tokens, TokenType } from "constants/";

const { REACT_APP_LOCAL, NODE_ENV } = process.env;

const PREFIX = "namada";
const PREFIX_TESTNET = "atest";

export type KeplrExtension = {
  experimentalSuggestChain: (chainInfo: ChainInfo) => Promise<void>;
  enable: (chainId: string) => Promise<void>;
  getKey: (chainId: string) => Promise<{
    // Name of the selected key store.
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
  }>;
};

type WindowWithKeplr = Window &
  typeof globalThis & {
    keplr: KeplrExtension;
  };

class Keplr {
  /**
   * Pass a chain config into constructor to instantiate, and optionally
   * override keplr instance for testing
   * @param _chain
   * @param _keplr
   */
  constructor(
    private _chain: Chain,
    private _keplr = (<WindowWithKeplr>window)?.keplr
  ) {}

  /**
   * Chain accessor get method
   * @returns {Chain}
   */
  public get chain(): Chain {
    return this._chain;
  }

  /**
   * Determine if keplr extension is loaded
   * @returns {boolean}
   */
  public detect(): boolean {
    return !!this._keplr;
  }

  /**
   * Enable connection to Keplr for current chain
   * @returns {Promise<boolean>}
   */
  public async enable(): Promise<boolean> {
    if (this._keplr) {
      const { id } = this._chain;

      return this._keplr
        .enable(id)
        .then(() => true)
        .catch(() => Promise.reject(false));
    }
    return Promise.reject(false);
  }

  /**
   * Get key for current chain
   * @returns {Promise<boolean}
   */
  public async getKey(): Promise<boolean> {
    if (this._keplr) {
      const { id } = this._chain;

      return this._keplr
        .getKey(id)
        .then(() => true)
        .catch(() => Promise.reject(false));
    }
    return Promise.reject(false);
  }

  /**
   * Suggest a chain to Keplr extension
   * @returns {Promise<boolean>}
   */
  public async suggestChain(): Promise<boolean> {
    if (this._keplr) {
      const { id: chainId, alias: chainName, network } = this._chain;
      const { protocol, url, port } = network;
      const rpcUrl = `${protocol}://${url}${port ? ":" + port : ""}`;
      // The following should match our Rest API URL and be added to chain config
      // instead of hard-coding port here:
      const restUrl = `${protocol}://${url}:1317`;
      const bech32Prefix =
        REACT_APP_LOCAL || NODE_ENV === "development" ? PREFIX_TESTNET : PREFIX;

      const tokenType: TokenType = "ATOM";
      const token = Tokens[tokenType];
      const { symbol, coinGeckoId } = token;

      const currency = {
        coinDenom: symbol,
        coinMinimalDenom: "uatom", // Add this to Token config?
        coinDecimals: 6,
        coinGeckoId,
      };

      const chainInfo: ChainInfo = {
        rpc: rpcUrl,
        rest: restUrl,
        chainId,
        chainName,
        stakeCurrency: currency,
        bip44: {
          coinType: token.type,
        },
        bech32Config: {
          bech32PrefixAccAddr: bech32Prefix,
          bech32PrefixAccPub: bech32Prefix + "pub",
          bech32PrefixValAddr: bech32Prefix + "valoper",
          bech32PrefixValPub: bech32Prefix + "valoperpub",
          bech32PrefixConsAddr: bech32Prefix + "valcons",
          bech32PrefixConsPub: bech32Prefix + "valconspub",
        },
        currencies: [currency],
        feeCurrencies: [currency],
        gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 }, // This is optional!
      };

      return this._keplr
        .experimentalSuggestChain(chainInfo)
        .then(() => true)
        .catch(() => Promise.reject(false));
    }
    return Promise.reject(false);
  }
}

export default Keplr;
