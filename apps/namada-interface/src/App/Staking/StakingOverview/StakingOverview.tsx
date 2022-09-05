import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute, StakingAndGovernanceSubRoute } from "App/types";
import { StakingOverviewContainer } from "./StakingOverview.components";
import {
  Table,
  TableLink,
  TableDimmedCell,
  TableConfigurations,
} from "components/Table";

import { myBalancesData, myValidatorData, allValidatorsData } from "./fakeData";

import {
  MyBalanceRow,
  Validator,
  MyStaking,
} from "slices/StakingAndGovernance";

// My Balances table row renderer and configuration
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
const myBalancesConfigurations: TableConfigurations<MyBalanceRow> = {
  title: "My Balances",
  rowRenderer: myBalancesRowRenderer,
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "15%" },
    { uuid: "3", columnLabel: "", width: "55%" },
  ],
};

// we need to use this function so we can inject some stuff in the
// inner function
// it takes a function (validatorId: string) => void
// it returns a function (myValidatorRow: MyStaking) => JSX.Element
// the input function will be placed in the function, that is the reason for
// having to do this mental judo
const getMyValidatorsRowRendererComponent = (
  navigateToValidatorDetails: (validatorId: string) => void
): ((myValidatorRow: MyStaking) => JSX.Element) => {
  // This function (React component will be called by the <Table /> component)
  // we needed to wrap it to the above function creator, so we could inject
  // stuff that is case specific in it. Alternatively we could pass in
  // the callbacks amongst the row data
  const MyValidatorsRowRenderer = (myValidatorRow: MyStaking): JSX.Element => {
    return (
      <>
        <td>
          <TableLink
            onClick={() => {
              const formattedValidatorName = myValidatorRow.name
                .replace(" ", "-")
                .toLowerCase();

              // this function is defined at <Staking />
              // there it triggers a navigation. It then calls a callback
              // that was passed to it by its' parent <StakingAndGovernance />
              // in that callback function that is defined in <StakingAndGovernance />
              // an action is dispatched to fetch validator data and make in available
              navigateToValidatorDetails(formattedValidatorName);
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
  return MyValidatorsRowRenderer;
};

const getMyValidatorsConfiguration = (
  navigateToValidatorDetails: (validatorId: string) => void
): TableConfigurations<MyStaking> => {
  return {
    title: "My Validators",
    rowRenderer: getMyValidatorsRowRendererComponent(
      navigateToValidatorDetails
    ),
    columns: [
      { uuid: "1", columnLabel: "Validator", width: "30%" },
      { uuid: "2", columnLabel: "Status", width: "40%" },
      { uuid: "3", columnLabel: "Staked Amount", width: "30%" },
    ],
  };
};

// All Validators table row renderer and configuration
const getAllValidatorsRowRendererComponent = (
  navigateToValidatorDetails: (validatorId: string) => void
): ((validator: Validator) => JSX.Element) => {
  const AllValidatorsRowRenderer = (validator: Validator): JSX.Element => {
    // this is now as a placeholder but in real case it will be in StakingOverview
    return (
      <>
        <td>
          <TableLink
            onClick={() => {
              const formattedValidatorName = validator.name
                .replace(" ", "-")
                .toLowerCase();

              navigateToValidatorDetails(formattedValidatorName);
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

  return AllValidatorsRowRenderer;
};
const getAllValidatorsConfiguration = (
  navigateToValidatorDetails: (validatorId: string) => void
): TableConfigurations<Validator> => {
  return {
    title: "All Validators",
    rowRenderer: getAllValidatorsRowRendererComponent(
      navigateToValidatorDetails
    ),
    columns: [
      { uuid: "1", columnLabel: "Validator", width: "45%" },
      { uuid: "2", columnLabel: "Voting power", width: "25%" },
      { uuid: "3", columnLabel: "Commission", width: "30%" },
    ],
  };
};

type Props = {
  navigateToValidatorDetails: (validatorId: string) => void;
  validators: Validator[];
  ownValidators: Validator[];
};

export const StakingOverview = (props: Props): JSX.Element => {
  const { navigateToValidatorDetails } = props;

  // we get the configurations for 2 tables that contain callbacks
  const myValidatorsConfiguration = getMyValidatorsConfiguration(
    navigateToValidatorDetails
  );
  const allValidatorsConfiguration = getAllValidatorsConfiguration(
    navigateToValidatorDetails
  );

  return (
    <StakingOverviewContainer>
      {/* my balances */}
      <Table
        title="My Balances"
        data={myBalancesData}
        tableConfigurations={myBalancesConfigurations}
      />

      {/* my validators */}
      <Table
        title="My Validators"
        data={myValidatorData}
        tableConfigurations={myValidatorsConfiguration}
      />

      {/* all validators */}
      <Table
        title="All Validators"
        data={allValidatorsData}
        tableConfigurations={allValidatorsConfiguration}
      />
    </StakingOverviewContainer>
  );
};
