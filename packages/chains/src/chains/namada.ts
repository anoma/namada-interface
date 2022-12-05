import { Chain, Extensions } from "@anoma/types";

const namada: Chain = {
  alias: "Namada Testnet",
  bech32Prefix: "atest",
  bip44: {
    coinType: 118,
  },
  rpc: "http://localhost:26657",
  chainId: "namada-75a7e12.69483d59a9fb174",
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
