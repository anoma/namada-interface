import { Validator, MyStaking, MyBalanceRow } from "./types";
export const myBalancesData: MyBalanceRow[] = [
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

export const myValidatorData: MyStaking[] = [
  {
    uuid: "1",
    name: "Polychain capital",
    homepageUrl: "poly",
    stakingStatus: "Bonded",
    stakedAmount: "10.00",
  },
  {
    uuid: "2",
    name: "Figment",
    homepageUrl: "poly",
    stakingStatus: "Bonded Pending",
    stakedAmount: "3.00",
  },
  {
    uuid: "3",
    name: "P2P",
    homepageUrl: "poly",
    stakingStatus: "Unboding (22 days left)",
    stakedAmount: "20.00",
  },
];

export const allValidatorsData: Validator[] = [
  {
    uuid: "1",
    name: "Polychain capital",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "2",
    name: "Figment",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "3",
    name: "P2P",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "4",
    name: "Coinbase Custody",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "5",
    name: "Chorus One",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "6",
    name: "Binance Staking",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "7",
    name: "DokiaCapital",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "8",
    name: "Kraken",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "9",
    name: "Zero Knowledge Validator (ZKV)",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
  {
    uuid: "10",
    name: "Paradigm",
    homepageUrl: "https://polychain.capital",
    votingPower: "NAM 100 000",
    commission: "20%",
  },
];
