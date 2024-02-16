import { BridgeType, Chain, Extensions } from "@namada/types";
import { ProxyMappings } from "../types";

const DEFAULT_CHAIN_ID = "osmosis-1";
const DEFAULT_RPC = "https://rpc-osmosis.keplr.app";

const {
  NAMADA_INTERFACE_PROXY: isProxied,
  NAMADA_INTERFACE_OSMOSIS_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
  NAMADA_INTERFACE_OSMOSIS_URL: rpc = DEFAULT_RPC,
} = process.env;

const osmosis: Chain = {
  id: "osmosis",
  alias: "Osmosis",
  bech32Prefix: "osmo",
  bip44: {
    coinType: 118,
  },
  bridgeType: [BridgeType.IBC],
  rpc: isProxied ? ProxyMappings["osmosis"] : rpc,
  chainId,
  currency: {
    token: "uosmo",
    symbol: "OSMO",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["keplr"],
  ibc: {
    portId: "transfer",
  },
};

export default osmosis;
