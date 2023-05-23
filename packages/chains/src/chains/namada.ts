import { BridgeType, Chain, Extensions } from "@anoma/types";

const DEFAULT_ALIAS = "Namada Testnet";
const DEFAULT_CHAIN_ID = "qc-testnet-5.1.025a61165acd05e";
const DEFAULT_RPC =
  "https://d3brk13lbhxfdb.cloudfront.net/qc-testnet-5.1.025a61165acd05e";
const DEFAULT_BECH32_PREFIX = "atest";

const {
  REACT_APP_NAMADA_ALIAS: alias = DEFAULT_ALIAS,
  REACT_APP_NAMADA_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
  REACT_APP_NAMADA_URL: rpc = DEFAULT_RPC,
  REACT_APP_NAMADA_BECH32_PREFIX: bech32Prefix = DEFAULT_BECH32_PREFIX,
} = process.env;

const namada: Chain = {
  alias,
  bech32Prefix,
  bip44: {
    // See Namada coin type at https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    coinType: 877,
  },
  bridgeType: [BridgeType.IBC, BridgeType.Ethereum],
  rpc,
  chainId,
  currency: {
    token: "Nam",
    symbol: "NAM",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["anoma"],
  ibc: {
    portId: "transfer",
  },
};

export default namada;
