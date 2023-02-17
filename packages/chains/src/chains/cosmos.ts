import { Chain, Extensions } from "@anoma/types";

const DEFAULT_ALIAS = "Cosmos Hub";
const DEFAULT_CHAIN_ID = "cosmoshub-4";
const DEFAULT_RPC = "https://api.cosmos.network/";

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
