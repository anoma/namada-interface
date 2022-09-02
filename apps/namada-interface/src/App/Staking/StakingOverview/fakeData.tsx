import { useNavigate } from "react-router-dom";

import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import {
  Table,
  TableConfigurations,
  RowBase,
  TableLink,
  TableDimmedCell,
} from "components/Table";

export type Validator = RowBase & {
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

const myBalancesRowRenderer = (myBalanceRow: MyBalanceRow): JSX.Element => {
  return (
    <>
      <td>{myBalanceRow.key}</td>
      <td>{myBalanceRow.baseCurrency}</td>
      <td>
        <TableDimmedCell>{myBalanceRow.fiatCurrency}</TableDimmedCell>
      </td>
    </>
  );
};

export const myBalancesConfigurations: TableConfigurations<MyBalanceRow> = {
  title: "My Balances",
  rowRenderer: myBalancesRowRenderer,
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "15%" },
    { uuid: "3", columnLabel: "", width: "55%" },
  ],
};

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

const MyValidatorsRowRenderer = (
  myValidatorRow: MyValidatorsRow
): JSX.Element => {
  // this is now as a placeholder but in real case it will be in StakingOverview
  const navigate = useNavigate();
  return (
    <>
      <td>
        <TableLink
          onClick={() => {
            const formattedValidatorName = myValidatorRow.name
              .replace(" ", "-")
              .toLowerCase();

            navigate(
              `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.ValidatorDetails}/${formattedValidatorName}`
            );
          }}
        >
          {myValidatorRow.name}
        </TableLink>
      </td>
      <td>{myValidatorRow.stakingStatus}</td>
      <td>{myValidatorRow.stakedAmount}</td>
    </>
  );
};

export const myValidatorsConfiguration: TableConfigurations<MyValidatorsRow> = {
  title: "My Validators",
  rowRenderer: MyValidatorsRowRenderer,
  columns: [
    { uuid: "1", columnLabel: "Validator", width: "30%" },
    { uuid: "2", columnLabel: "Status", width: "40%" },
    { uuid: "3", columnLabel: "Staked Amount", width: "30%" },
  ],
};

// all validators
type AllValidatorData = Validator & {
  votingPower: string;
  commission: string;
};

const AllValidatorsRowRenderer = (validator: AllValidatorData): JSX.Element => {
  // this is now as a placeholder but in real case it will be in StakingOverview
  const navigate = useNavigate();
  return (
    <>
      <td>
        <TableLink
          onClick={() => {
            const formattedValidatorName = validator.name
              .replace(" ", "-")
              .toLowerCase();

            navigate(
              `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}${StakingAndGovernanceSubRoute.ValidatorDetails}/${formattedValidatorName}`
            );
          }}
        >
          {validator.name}
        </TableLink>
      </td>
      <td>{validator.votingPower}</td>
      <td>{validator.commission}</td>
    </>
  );
};

export const allValidatorsData: AllValidatorData[] = [
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

export const allValidatorsConfiguration: TableConfigurations<AllValidatorData> =
  {
    title: "All Validators",
    rowRenderer: AllValidatorsRowRenderer,
    columns: [
      { uuid: "1", columnLabel: "Validator", width: "45%" },
      { uuid: "2", columnLabel: "Voting power", width: "25%" },
      { uuid: "3", columnLabel: "Commission", width: "30%" },
    ],
  };
