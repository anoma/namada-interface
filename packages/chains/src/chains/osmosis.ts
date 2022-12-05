import { Chain, Extensions } from "@anoma/types";

const osmosis: Chain = {
  alias: "Osmosis Testnet",
  bech32Prefix: "osmo",
  bip44: {
    coinType: 1,
  },
  rpc: "http://localhost:12345",
  chainId: "osmosis-75a7e12.69483d59a9fb174",
  currency: {
    token: "Osmosis",
    symbol: "OSMO",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["keplr"],
  ibc: {
    portId: "transfer",
  },
};

export default osmosis;
