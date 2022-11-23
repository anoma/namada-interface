import { Chain, IBCCurrency } from "@anoma/types";

const bech32Prefix = "namada";
export const chains: Chain[] = [];
const DEFAULT_CHAIN_ID = "namada-75a7e12.69483d59a9fb174";

const ibcCurrency: IBCCurrency = {
  coinDenom: "NAM",
  coinMinimalDenom: "nam",
  coinDecimals: 6,
  originChainId: DEFAULT_CHAIN_ID,
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
const defaultChain: Chain = {
  rpc: "http://localhost:26657",
  rest: "http://localhost:1317",
  chainId: DEFAULT_CHAIN_ID,
  chainName: "Namada Testnet",
  stakeCurrency: ibcCurrency,
  bip44: {
    // coinType = testnet (all coins) - Slip-0044
    // See: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    coinType: 1,
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
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 }, // Optional
  features: ["ibc-transfer"],
  beta: false,
};

chains.push(defaultChain);
