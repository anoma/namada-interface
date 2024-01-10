import { BridgeType, Chain, Extensions } from "@namada/types";
import { ProxyMappings } from "../types";

const DEFAULT_ALIAS = "Namada";
const DEFAULT_CHAIN_ID = "public-testnet-15.0dacadb8d663";
const DEFAULT_RPC = "https://proxy.heliax.click/public-testnet-15.0dacadb8d663";
const DEFAULT_BECH32_PREFIX = "tnam";

const {
  NAMADA_INTERFACE_PROXY: isProxied,
  NAMADA_INTERFACE_NAMADA_ALIAS: alias = DEFAULT_ALIAS,
  NAMADA_INTERFACE_NAMADA_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
  NAMADA_INTERFACE_NAMADA_URL: rpc = DEFAULT_RPC,
  NAMADA_INTERFACE_NAMADA_BECH32_PREFIX: bech32Prefix = DEFAULT_BECH32_PREFIX,
} = process.env;

const namada: Chain = {
  id: "namada",
  alias,
  bech32Prefix,
  bip44: {
    // See Namada coin type at https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    coinType: 877,
  },
  bridgeType: [BridgeType.IBC, BridgeType.Ethereum],
  rpc: isProxied ? ProxyMappings["namada"] : rpc,
  chainId,
  currency: {
    token: "Nam",
    symbol: "NAM",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["namada"],
  ibc: {
    portId: "transfer",
  },
};

export default namada;
