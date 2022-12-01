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
  chainId: string;
  currency: Currency;
  rpc: string;
  ibc?: {
    portId: string;
  };
};
