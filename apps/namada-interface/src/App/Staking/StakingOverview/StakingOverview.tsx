import { useState } from "react";
import { MainContainerNavigation } from "App/StakingAndGovernance/MainContainerNavigation";
import { StakingOverviewContainer } from "./StakingOverview.components";
import { Table } from "components/Table";
import {
  Validator,
  allValidatorsConfiguration,
  myBalancesConfigurations,
  myValidatorsConfiguration,
  myBalancesData,
  myValidatorData,
  allValidatorsData,
} from "./fakeData";

type Props = {
  navigateToValidatorDetails: (validatorId: string) => void;
  validators: Validator[];
  ownValidators: Validator[];
};

export const StakingOverview = (props: Props): JSX.Element => {
  const { navigateToValidatorDetails } = props;
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
