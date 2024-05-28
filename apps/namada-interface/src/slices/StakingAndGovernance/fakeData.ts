import BigNumber from "bignumber.js";

import { MyBalanceEntry, StakingPosition, Validator } from "./types";
export const myBalancesData: MyBalanceEntry[] = [
  {
    uuid: "1",
    key: "Total Balance",
    baseCurrency: "NAM 33.00",
  },
  {
    uuid: "2",
    key: "Total Bonded",
    baseCurrency: "NAM 10.00",
  },
  {
    uuid: "3",
    key: "Pending Rewards",
    baseCurrency: "NAM 23.00",
  },
  {
    uuid: "4",
    key: "Available for Bonding",
    baseCurrency: "NAM 10.00",
  },
];

export const myStakingData: StakingPosition[] = [
  {
    uuid: "1",
    bonded: true,
    stakedAmount: new BigNumber(10_000_000),
    owner: "some-owner",
    totalRewards: "0.55",
    validatorId: "polychain-capital",
  },
  {
    uuid: "2",
    bonded: true,
    stakedAmount: new BigNumber(3_000_000),
    owner: "some-owner",
    totalRewards: "0.15",
    validatorId: "coinbase-custody",
  },
  {
    uuid: "3",
    bonded: true,
    stakedAmount: new BigNumber(20_000_000),
    owner: "some-owner",
    totalRewards: "1.05",
    validatorId: "kraken",
  },
];

export const allValidatorsData: Validator[] = [
  {
    uuid: "polychain-capital",
    name: "Polychain capital",
    homepageUrl: "https://polychain.capital",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.22),
    description:
      "Polychain is an investment firm committed to exceptional returns for investors through actively managed portfolios of blockchain assets.",
  },
  {
    uuid: "figment",
    name: "Figment",
    homepageUrl: "https://figment.io",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description:
      "Makers of Hubble and Canada’s largest Cosmos validator, Figment is the easiest and most secure way to stake your Atoms.",
  },
  {
    uuid: "p2p",
    name: "P2P",
    homepageUrl: "https://p2p.org",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description:
      "One of the winners of Cosmos Game of Stakes. We provide a simple, secure and intelligent staking service to help you generate rewards on your blockchain assets across 9+ networks within a single interface. Let’s stake together - p2p.org.",
  },
  {
    uuid: "coinbase-custody",
    name: "Coinbase Custody",
    homepageUrl: "https://custody.coinbase.com",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description: "Coinbase Custody Cosmos Validator",
  },
  {
    uuid: "chorus-one",
    name: "Chorus One",
    homepageUrl: "https://chorus.one",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description:
      "Secure Cosmos and shape its future by delegating to Chorus One, a highly secure and stable validator. By delegating, you agree to the terms of service at: https://chorus.one/cosmos/tos",
  },
  {
    uuid: "binance-staking",
    name: "Binance Staking",
    homepageUrl: "https://binance.com",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description: "Exchange the world",
  },
  {
    uuid: "dokiacapital",
    name: "DokiaCapital",
    homepageUrl: "https://staking.dokia.cloud",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description:
      "Downtime is not an option for Dokia Capital. We operate an enterprise-grade infrastructure that is robust and secure.",
  },
  {
    uuid: "kraken",
    name: "Kraken",
    homepageUrl: "https://kraken.com",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description: "Kraken Exchange validator",
  },
  {
    uuid: "zero-knowledge-validator-(ZKV)",
    name: "Zero Knowledge Validator (ZKV)",
    homepageUrl: "https://zkvalidator.com",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description:
      "Zero Knowledge Validator: Stake & Support ZKP Research & Privacy Tech",
  },
  {
    uuid: "paradigm",
    name: "Paradigm",
    homepageUrl: "https://www.paradigm.xyz",
    votingPower: new BigNumber(100_000),
    commission: new BigNumber(0.2),
    description: "",
  },
];
