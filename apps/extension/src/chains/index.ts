import { ChainInfo as Chain, IBCCurrency } from "@keplr-wallet/types";
const bech32Prefix = "namada";

const ibcCurrency: IBCCurrency = {
  coinDenom: "NAM",
  coinMinimalDenom: "nam", // Add this to Token config?
  coinDecimals: 6,
  originChainId: "namada-test.XXXXXXXXX",
  originCurrency: undefined,
  paths: [
    {
      portId: "transfer",
      channelId: "channel-0",
    },
  ],
};

/**
 * Define chains to embed within extension
 */
const chain: Chain = {
  // TODO: Use NODE_ENV to determine a localhost versus production configuration
  rpc: "http://localhost:26657",
  rest: "http://localhost:1317",
  chainId: "namada-test.XXXXXXXXXXXX",
  chainName: "Namada Testnet",
  stakeCurrency: ibcCurrency,
  bip44: {
    coinType: 9999,
  },
  bech32Config: {
    bech32PrefixAccAddr: bech32Prefix,
    bech32PrefixAccPub: `${bech32Prefix}pub`,
    bech32PrefixValAddr: `${bech32Prefix}valoper`,
    bech32PrefixValPub: `${bech32Prefix}valoperpub`,
    bech32PrefixConsAddr: `${bech32Prefix}valcons`,
    bech32PrefixConsPub: `${bech32Prefix}valconspub`,
  },
  currencies: [ibcCurrency],
  feeCurrencies: [ibcCurrency],
  // TODO: This should be configured for production:
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 }, // Optional
  features: ["ibc-transfer"],
  beta: false,
};

export const chains = [chain];
