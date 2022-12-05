import { Chain, Extensions } from "@anoma/types";

const cosmos: Chain = {
  alias: "Cosmos Testnet",
  bech32Prefix: "cosmos",
  bip44: {
    coinType: 118,
  },
  rpc: "http://localhost:12345",
  chainId: "cosmos-75a7e12.69483d59a9fb174",
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
