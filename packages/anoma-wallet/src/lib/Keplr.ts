import { ChainInfo } from "@keplr-wallet/types";

import { Chain } from "config";
import { Tokens, TokenType } from "constants/";

type SuggestChain = (chainInfo: ChainInfo) => Promise<void>;

type WindowWithKeplr = Window &
  typeof globalThis & {
    keplr: {
      experimentalSuggestChain?: SuggestChain;
    };
  };

class Keplr {
  private _suggestChain: SuggestChain | undefined;

  constructor(private _chain: Chain) {
    const keplr = (<WindowWithKeplr>window)?.keplr;
    this._suggestChain = keplr?.experimentalSuggestChain;
  }

  public get chain(): Chain {
    return this._chain;
  }

  public detect(): boolean {
    return !!this._suggestChain;
  }

  public async suggestChain(): Promise<boolean> {
    if (this._suggestChain) {
      const { id, alias, network } = this._chain;
      const { protocol, url, port } = network;
      const rpcUrl = `${protocol}://${url}${port ? ":" + port : ""}`;
      // The following should match our Rest API URL and be added to chain config
      // instead of hard-coding port here:
      const restUrl = `${protocol}://${url}:1317`;

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
        chainId: id,
        chainName: alias,
        stakeCurrency: currency,
        bip44: {
          coinType: token.type,
        },
        bech32Config: {
          bech32PrefixAccAddr: "cosmos",
          // Should the following change to match Namada (e.g., "atest", etc)?
          bech32PrefixAccPub: "cosmos" + "pub",
          bech32PrefixValAddr: "cosmos" + "valoper",
          bech32PrefixValPub: "cosmos" + "valoperpub",
          bech32PrefixConsAddr: "cosmos" + "valcons",
          bech32PrefixConsPub: "cosmos" + "valconspub",
        },
        currencies: [currency],
        feeCurrencies: [currency],
        gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 }, // This is optional!
      };

      console.log({ chainInfo });

      await this._suggestChain(chainInfo);

      return true;
    }
    return false;
  }
}

export default Keplr;
