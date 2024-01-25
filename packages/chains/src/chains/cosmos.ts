import { BridgeType, Chain, Extensions } from "@namada/types";
import { ProxyMappings } from "../types";

const DEFAULT_ALIAS = "Cosmos Hub";
const DEFAULT_CHAIN_ID = "cosmoshub-4";
const DEFAULT_RPC = "https://api.cosmos.network/";

const {
  NAMADA_INTERFACE_PROXY: isProxied,
  NAMADA_INTERFACE_COSMOS_ALIAS: alias = DEFAULT_ALIAS,
  NAMADA_INTERFACE_COSMOS_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
  NAMADA_INTERFACE_COSMOS_URL: rpc = DEFAULT_RPC,
} = process.env;

const cosmos: Chain = {
  id: "cosmos",
  alias,
  bech32Prefix: "cosmos",
  bip44: {
    coinType: 118,
  },
  bridgeType: [BridgeType.IBC],
  rpc: isProxied ? ProxyMappings["cosmos"] : rpc,
  chainId,
  currency: {
    token: "uatom",
    symbol: "ATOM",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["keplr"],
  ibc: {
    portId: "transfer",
  },
};

export default cosmos;
