import { AccountType, Chain } from "@anoma/types";
import { KdfType, KeyStore } from "background/keyring";

export const NAM = {
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
};

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
  currencies: [NAM],
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
    "atest1d9khqw36gvurxv6yxcmyvv6pgdzyxwp3g9z5gv6px5cyxs348yenjd6ygse5y32xxapy2dph26clnv",
  chainId: "namada-75a7e12.69483d59a9fb174",
  id: "324bfe0e-cb19-5f1a-9630-9daaaecadabe",
  path: {
    account: 0,
    change: 0,
  },
  crypto: {
    cipher: {
      type: "aes-256-gcm",
      iv: new Uint8Array([21, 236, 255, 45, 1, 85, 224, 91, 131, 95, 216, 186]),
      text: new Uint8Array([
        250, 49, 107, 16, 63, 98, 41, 44, 127, 146, 84, 218, 118, 97, 236, 40,
        151, 60, 2, 34, 75, 141, 136, 8, 177, 122, 11, 116, 5, 165, 11, 51, 46,
        148, 217, 177, 100, 189, 77, 88, 136, 230, 123, 84, 179, 56, 23, 134,
        81, 248, 158, 123, 219, 47, 107, 5, 216, 47, 214, 73, 28, 104, 247, 202,
        3, 114, 61, 76, 221, 122, 232, 12, 141, 24, 132, 236, 17, 167, 219, 118,
        244, 138, 139, 17, 169, 127, 124, 243, 23, 172, 41, 29,
      ]),
    },
    kdf: {
      type: KdfType.Argon2,
      params: {
        m_cost: 4096,
        t_cost: 3,
        p_cost: 1,
        salt: "Z29nfsJfAbe51KPQQcmlMA",
      },
    },
  },
  type: AccountType.Mnemonic,
};

export const mnemonic =
  "uncover refuse athlete early valid clump used punch season little hire split";

export const password = "asd";
