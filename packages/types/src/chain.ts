export type Currency = {
  token: string;
  symbol: string;
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
};

export type Chain = {
  alias: string;
  bech32Prefix: string;
  bip44: {
    coinType: number;
  };
  rpc: string;
  chainId: string;
  currency: Currency;
  ibc?: {
    portId: string;
  };
};
