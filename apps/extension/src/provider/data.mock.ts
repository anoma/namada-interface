import { Chain } from "@anoma/types";

export const chain: Chain = {
  rpc: "http://localhost:26657",
  rest: "http://localhost:1317",
  chainId: "namada-test.XXXXXXXXXXXX",
  chainName: "Namada Testnet",
  stakeCurrency: {
    coinDenom: "NAM",
    coinMinimalDenom: "nam",
    coinDecimals: 6,
  },
  bip44: {
    coinType: 9999,
  },
  bech32Config: {
    bech32PrefixAccAddr: "namada",
    bech32PrefixAccPub: "namadapub",
    bech32PrefixValAddr: "namadavaloper",
    bech32PrefixValPub: "namadavaloperpub",
    bech32PrefixConsAddr: "namadavalcons",
    bech32PrefixConsPub: "namadavalconspub",
  },
  currencies: [
    {
      coinDenom: "NAM",
      coinMinimalDenom: "nam",
      coinDecimals: 6,
      originChainId: "namada-test.XXXXXXXXX",
      paths: [
        {
          portId: "transfer",
          channelId: "channel-0",
        },
      ],
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NAM",
      coinMinimalDenom: "nam",
      coinDecimals: 6,
    },
  ],
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.03,
  },
  features: ["ibc-transfer"],
  beta: false,
};
