import { Chain, Extensions } from "@anoma/types";

const DEFAULT_ALIAS = "Osmosis Testnet";
const DEFAULT_CHAIN_ID = "osmosis-75a7e12.69483d59a9fb174";
const DEFAULT_RPC = "http://localhost:12345";

const {
  REACT_APP_OSMOSIS_ALIAS: alias = DEFAULT_ALIAS,
  REACT_APP_OSMOSIS_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
  REACT_APP_OSMOSIS_CHAIN_URL: rpc = DEFAULT_RPC,
} = process.env;

const osmosis: Chain = {
  alias,
  bech32Prefix: "osmo",
  bip44: {
    coinType: 1,
  },
  rpc,
  chainId,
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
