import { Chain } from "@anoma/types";

const bech32Prefix = "namada";
export const chains: Chain[] = [];
const DEFAULT_CHAIN_ID = "namada-75a7e12.69483d59a9fb174";

/**
 * Define chains to embed within extension
 */
const defaultChain: Chain = {
  alias: "Namada Testnet",
  bech32Prefix,
  rpc: "http://localhost:26657",
  chainId: DEFAULT_CHAIN_ID,
  currency: {
    token: "Namada",
    symbol: "NAM",
  },
  bip44: {
    // coinType = testnet (all coins) - Slip-0044
    // See: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    coinType: 1,
  },
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 }, // Optional
};

chains.push(defaultChain);
