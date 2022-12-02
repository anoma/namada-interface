export type Chain = {
  alias: string;
  bech32Prefix: string;
  rpc: string;
  chainId: string;
  bip44: {
    coinType: number;
  };
  currency: {
    token: string;
    symbol: string;
  };
  ibc?: {
    portId: string;
  };
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
};
