import { Chain } from "@anoma/types";

const osmosis: Chain = {
  alias: "Osmosis Testnet",
  bech32Prefix: "osmo",
  rpc: "http://localhost:12345",
  chainId: "osmosis-75a7e12.69483d59a9fb174",
  currency: {
    token: "Osmosis",
    symbol: "OSMO",
  },
  bip44: {
    coinType: 1,
  },
  ibc: {
    portId: "transfer",
  },
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
};

export default osmosis;
