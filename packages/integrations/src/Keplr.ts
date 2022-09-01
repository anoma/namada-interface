import {
  Keplr as IKeplr,
  ChainInfo,
  Key,
  Window as KeplrWindow,
} from "@keplr-wallet/types";
import { AccountData } from "@cosmjs/proto-signing";
import { Chain } from "./types";
import { Tokens, TokenType } from "@anoma/tx";

const { REACT_APP_LOCAL, NODE_ENV } = process.env;
const DEV_ENV = !!(REACT_APP_LOCAL || NODE_ENV === "development");

const BECH32_PREFIX = "namada";
const BECH32_PREFIX_TESTNET = "cosmos";
const KEPLR_NOT_FOUND = "Keplr extension not found!";
const DEFAULT_FEATURES: string[] = [];
const IBC_FEATURE = "ibc-transfer";

type OfflineSigner = ReturnType<IKeplr["getOfflineSigner"]>;

class Keplr {
  private _offlineSigner: OfflineSigner | undefined;
  private _features: string[] = [];
  /**
   * Pass a chain config into constructor to instantiate, and optionally
   * override keplr instance for testing
   * @param chain
   * @param _keplr
   */
  constructor(
    public readonly chain: Chain,
    private readonly _keplr = (<KeplrWindow>window)?.keplr
  ) {
    // If chain is ibc-enabled, add relevant feature:
    const { ibc = [] } = chain;
    this._features.push(...DEFAULT_FEATURES);

    if (ibc.length > 0) {
      this._features.push(IBC_FEATURE);
    }
  }

  /**
   * Get Keplr extension
   * @returns {IKeplr | undefined}
   */
  public get instance(): IKeplr | undefined {
    return this._keplr;
  }

  /**
   * Get offline signer for current chain
   * @returns {OfflineSigner}
   */
  public get offlineSigner(): OfflineSigner {
    if (this._offlineSigner) {
      return this._offlineSigner;
    }

    if (this._keplr) {
      const { id } = this.chain;
      this._offlineSigner = this._keplr.getOfflineSigner(id);
      return this._offlineSigner;
    }
    throw new Error(KEPLR_NOT_FOUND);
  }

  /**
   * Determine if keplr extension exists
   * @returns {boolean}
   */
  public detect(): boolean {
    return !!this._keplr;
  }

  /**
   * Determine if chain has already been added to extension. Keplr
   * will throw an error if chainId is not found
   * @returns {Promise<boolean>}
   */
  public async detectChain(): Promise<boolean> {
    if (this._keplr) {
      try {
        await this._keplr.getOfflineSignerAuto(this.chain.id);
        return true;
      } catch (e) {
        return false;
      }
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Enable connection to Keplr for current chain
   * @returns {Promise<boolean>}
   */
  public async enable(): Promise<boolean> {
    if (this._keplr) {
      const { id } = this.chain;

      await this._keplr.enable(id);
      return true;
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Get key from Keplr for current chain
   * @returns {Promise<boolean>}
   */
  public async getKey(): Promise<Key> {
    if (this._keplr) {
      const { id } = this.chain;
      return await this._keplr.getKey(id);
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Get accounts from offline signer
   * @returns {Promise<readonly AccountData[]>}
   */
  public async getAccounts(): Promise<readonly AccountData[]> {
    if (this._keplr) {
      return await this.offlineSigner.getAccounts();
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Suggest a chain to Keplr extension
   * @returns {Promise<boolean>}
   */
  public async suggestChain(): Promise<boolean> {
    if (this._keplr) {
      const { id: chainId, alias: chainName, network } = this.chain;
      const { protocol, url, port } = network;
      const rpcUrl = `${protocol}://${url}${port ? ":" + port : ""}`;
      // The following is the Light Client Daemon (LCD) REST address.
      // TODO: Add LCD restUrl to Chain type and config
      const restUrl = `${protocol}://${url}:1317`;
      const bech32Prefix = DEV_ENV ? BECH32_PREFIX_TESTNET : BECH32_PREFIX;

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
        /*
        NOTE: Optionally specify rpcConfig for more granular configuration:
        rpcConfig: AxiosRequestConfig,
        */
        rest: restUrl,
        /*
        NOTE: Optionally specify restConfig for more granular configuration:
        rpcConfig: AxiosRequestConfig,
        */
        chainId,
        chainName,
        stakeCurrency: currency,
        bip44: {
          coinType: token.type,
        },
        bech32Config: {
          bech32PrefixAccAddr: bech32Prefix,
          bech32PrefixAccPub: `${bech32Prefix}pub`,
          bech32PrefixValAddr: `${bech32Prefix}valoper`,
          bech32PrefixValPub: `${bech32Prefix}valoperpub`,
          bech32PrefixConsAddr: `${bech32Prefix}valcons`,
          bech32PrefixConsPub: `${bech32Prefix}valconspub`,
        },
        currencies: [currency],
        feeCurrencies: [currency],
        // TODO: This should be configured for production:
        gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 }, // Optional
        features: this._features,
        beta: DEV_ENV,
      };

      await this._keplr.experimentalSuggestChain(chainInfo);
      return true;
    }

    return Promise.reject(KEPLR_NOT_FOUND);
  }
}

export default Keplr;
