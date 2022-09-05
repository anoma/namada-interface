import { useNavigate } from "react-router-dom";

import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import { RowBase } from "components/Table";

type Validator = RowBase & {
  name: string;
  homepageUrl: string;
};

// my balances
type MyBalanceRow = RowBase & {
  key: string;
  baseCurrency: string;
  fiatCurrency: string;
};

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

// my validators
type MyValidatorsRow = Validator & {
  stakingStatus: string;
  stakedAmount: string;
};

export const myValidatorData: MyValidatorsRow[] = [
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
