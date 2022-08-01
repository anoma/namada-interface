import { ChainInfo } from "@keplr-wallet/types";
import { Chain } from "config";

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
}

export default Keplr;
