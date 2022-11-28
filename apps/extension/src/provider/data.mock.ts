import { AccountType, Chain } from "@anoma/types";
import { KdfType, KeyStore } from "background/keyring";

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

export const keyStore: KeyStore = {
  alias: "Address",
  address:
    "atest1d9khqw36gv65v33jxuerss3s8pzyxwfhgfzyysfhx3pnxse5x3prvw2pgfprsdpkxq6nqd2zfjywqg",
  chainId: "namada-75a7e12.69483d59a9fb174",
  id: "d0337325-1798-5fd1-b2bc-7d17fd6a0bd5",
  path: {
    account: 0,
    change: 0,
  },
  crypto: {
    cipher: {
      type: "aes-256-gcm",
      iv: new Uint8Array([
        103, 48, 102, 233, 62, 223, 93, 120, 155, 193, 248, 164,
      ]),
      text: new Uint8Array([
        23, 95, 203, 173, 104, 100, 219, 82, 175, 55, 13, 243, 231, 60, 199,
        151, 195, 53, 78, 161, 200, 114, 57, 15, 244, 209, 71, 34, 105, 183,
        168, 195, 197, 7, 8, 35, 149, 117, 88, 199, 13, 71, 155, 64, 104, 160,
        27, 0, 7, 172, 243, 174, 145, 238, 143, 33, 216, 115, 119, 235, 76, 159,
        138, 238, 9, 109, 35, 205, 251, 45, 172, 91, 169, 51, 145, 225, 237,
        189, 132, 97, 27, 58, 199, 203, 105, 201, 117, 175, 73, 74, 78, 156, 93,
      ]),
    },
    kdf: {
      type: KdfType.Argon2,
      params: {
        m_cost: 4096,
        t_cost: 3,
        p_cost: 1,
        salt: "uhdfd0vBiAtfO3a2Feollw",
      },
    },
  },
  type: AccountType.Mnemonic,
};
