import { Chain } from "@anoma/types";

const namada: Chain = {
  alias: "Namada Testnet",
  bech32Prefix: "atest",
  rpc: "http://localhost:26657",
  chainId: "namada-75a7e12.69483d59a9fb174",
  currency: {
    token: "Namada",
    symbol: "NAM",
    bip44: {
      coinType: 1,
    },

    gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  },

  ibc: {
    portId: "transfer",
  },
};

export default namada;
