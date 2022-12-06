import { Chain, Extensions } from "@anoma/types";

const DEFAULT_ALIAS = "Cosmos Testnet";
const DEFAULT_CHAIN_ID = "cosmos-75a7e12.69483d59a9fb174";
const DEFAULT_RPC = "http://localhost:12345";
const DEFAULT_BECH32_PREFIX = "atest";

const {
  REACT_APP_COSMOS_ALIAS: alias = DEFAULT_ALIAS,
  REACT_APP_COSMOS_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
  REACT_APP_COSMOS_CHAIN_URL: rpc = DEFAULT_RPC,
} = process.env;

const cosmos: Chain = {
  alias,
  bech32Prefix: "cosmos",
  bip44: {
    coinType: 118,
  },
  rpc,
  chainId,
  currency: {
    token: "Atom",
    symbol: "ATOM",
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },
  extension: Extensions["keplr"],
  ibc: {
    portId: "transfer",
  },
};

export default cosmos;
