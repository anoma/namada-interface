import { BridgeType, Chain, Extensions } from "@namada/types";
import { ProxyMappings } from "../types";

const DEFAULT_ALIAS = "Osmosis";
const DEFAULT_CHAIN_ID = "osmosis-5";
const DEFAULT_RPC = "https://rpc.osmotest5.osmosis.zone";

const rpc = DEFAULT_RPC;
const chainId = DEFAULT_CHAIN_ID;
const alias = DEFAULT_ALIAS;
const isProxied = false;

const cosmos: Chain = {
  id: "osmosis",
  alias,
  bech32Prefix: "osmosis",
  bip44: {
    coinType: 118,
  },
  bridgeType: [BridgeType.IBC],
  rpc: isProxied ? ProxyMappings["osmosis"] : rpc,
  chainId,
  currency: {
    token: "osmo",
    symbol: "OSMO",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["keplr"],
  ibc: {
    portId: "transfer",
  },
};

export default cosmos;
