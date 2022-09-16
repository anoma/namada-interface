import { Validator, MyStaking, MyBalanceEntry } from "./types";
export const myBalancesData: MyBalanceEntry[] = [
  {
    uuid: "1",
    key: "Total Balance",
    baseCurrency: "NAM 33.00",
    fiatCurrency: "EUR 33.00",
  },
  {
    uuid: "2",
    key: "Total Bonded",
    baseCurrency: "NAM 10.00",
    fiatCurrency: "EUR 10.00",
  },
  {
    uuid: "3",
    key: "Pending Rewards",
    baseCurrency: "NAM 23.00",
    fiatCurrency: "EUR 23.00",
  },
  {
    uuid: "4",
    key: "Available for Bonding",
    baseCurrency: "NAM 10.00",
    fiatCurrency: "EUR 10.00",
  },
];

export const myStakingData: MyStaking[] = [
  {
    uuid: "1",
    stakingStatus: "Bonded",
    stakedAmount: "10.00",
    validatorId: "polychain-capital",
  },
  {
    uuid: "2",
    stakingStatus: "Bonded Pending",
    stakedAmount: "3.00",
    validatorId: "coinbase-custody",
  },
  {
    uuid: "3",
    stakingStatus: "Unboding (22 days left)",
    stakedAmount: "20.00",
    validatorId: "kraken",
  },
];

export const allValidatorsData: Validator[] = [
  {
    uuid: "polychain-capital",
    name: "Polychain capital",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "22%",
  },
  {
    uuid: "figment",
    name: "Figment",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "p2p",
    name: "P2P",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "coinbase-custody",
    name: "Coinbase Custody",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "chorus-one",
    name: "Chorus One",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "binance-staking",
    name: "Binance Staking",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "dokiacapital",
    name: "DokiaCapital",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "kraken",
    name: "Kraken",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "zero-knowledge-validator-(ZKV)",
    name: "Zero Knowledge Validator (ZKV)",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "paradigm",
    name: "Paradigm",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
];
