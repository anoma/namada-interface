import {
  StakingOverviewContainer,
  ValidatorsContainer,
} from "./StakingOverview.components";
import { AllValidatorsTable } from "./AllValidatorsTable";
import { MyValidatorsTable } from "./MyValidatorsTable";
import { StakingBalancesList } from "./StakingBalancesList";

// callbacks in this type are specific to a certain row type
export type ValidatorsCallbacks = {
  onClickValidator: (validatorId: string) => void;
};

type Props = {
  navigateToValidatorDetails: (validatorId: string) => void;
};

// This is the default view for the staking. it displays all the relevant
// staking information of the user and allows unstake the active staking
// positions directly from here.
// * Unstaking happens by calling a callback that triggers a modal
//   view in the parent
// * user can also navigate to sibling view for validator details
export const StakingOverview = (props: Props): JSX.Element => {
  const { navigateToValidatorDetails } = props;

  return (
    <StakingOverviewContainer>
      <StakingBalancesList />

      <ValidatorsContainer>
        <MyValidatorsTable
          navigateToValidatorDetails={navigateToValidatorDetails}
        />

        <AllValidatorsTable
          navigateToValidatorDetails={navigateToValidatorDetails}
        />
      </ValidatorsContainer>
    </StakingOverviewContainer>
  );
};
