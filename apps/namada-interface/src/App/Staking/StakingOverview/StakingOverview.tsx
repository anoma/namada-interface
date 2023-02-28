import { Table, TableLink, TableConfigurations } from "@anoma/components";
import { Balance } from "slices/accounts";
import { Validator, MyValidators } from "slices/StakingAndGovernance";
import {
  StakingBalances,
  StakingBalancesLabel,
  StakingBalancesValue,
  StakingOverviewContainer,
} from "./StakingOverview.components";

const MyValidatorsRowRenderer = (
  myValidatorRow: MyValidators,
  callbacks?: ValidatorsCallbacks
): JSX.Element => {
  return (
    <>
      <td>
        <TableLink
          onClick={() => {
            const formattedValidatorName = myValidatorRow.validator.name
              .replace(" ", "-")
              .toLowerCase();

            // this function is defined at <Staking />
            // there it triggers a navigation. It then calls a callback
            // that was passed to it by its' parent <StakingAndGovernance />
            // in that callback function that is defined in <StakingAndGovernance />
            // an action is dispatched to fetch validator data and make in available
            callbacks && callbacks.onClickValidator(formattedValidatorName);
          }}
        >
          {myValidatorRow.validator.name}
        </TableLink>
      </td>
      <td>{myValidatorRow.stakingStatus}</td>
      <td>NAM {myValidatorRow.stakedAmount}</td>
    </>
  );
};

const getMyValidatorsConfiguration = (
  navigateToValidatorDetails: (validatorId: string) => void
): TableConfigurations<MyValidators, ValidatorsCallbacks> => {
  return {
    rowRenderer: MyValidatorsRowRenderer,
    columns: [
      { uuid: "1", columnLabel: "Validator", width: "30%" },
      { uuid: "2", columnLabel: "Status", width: "40%" },
      { uuid: "3", columnLabel: "Staked Amount", width: "30%" },
    ],
    callbacks: {
      onClickValidator: navigateToValidatorDetails,
    },
  };
};

// callbacks in this type are specific to a certain row type
type ValidatorsCallbacks = {
  onClickValidator: (validatorId: string) => void;
};

// AllValidators table row renderer and configuration
// it contains callbacks defined in AllValidatorsCallbacks
const AllValidatorsRowRenderer = (
  validator: Validator,
  callbacks?: ValidatorsCallbacks
): JSX.Element => {
  // this is now as a placeholder but in real case it will be in StakingOverview
  return (
    <>
      <td>
        <TableLink
          onClick={() => {
            const formattedValidatorName = validator.name
              .replace(" ", "-")
              .toLowerCase();

            callbacks && callbacks.onClickValidator(formattedValidatorName);
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

const getAllValidatorsConfiguration = (
  navigateToValidatorDetails: (validatorId: string) => void
): TableConfigurations<Validator, ValidatorsCallbacks> => {
  return {
    rowRenderer: AllValidatorsRowRenderer,
    callbacks: {
      onClickValidator: navigateToValidatorDetails,
    },
    columns: [
      { uuid: "1", columnLabel: "Validator", width: "45%" },
      { uuid: "2", columnLabel: "Voting power", width: "25%" },
      { uuid: "3", columnLabel: "Commission", width: "30%" },
    ],
  };
};

type Props = {
  addressesWithBalance: { address: string; balance: Balance }[];
  navigateToValidatorDetails: (validatorId: string) => void;
  validators: Validator[];
  myValidators: MyValidators[];
};

// This is the default view for the staking. it displays all the relevant
// staking information of the user and allows unstake the active staking
// positions directly from here.
// * Unstaking happens by calling a callback that triggers a modal
//   view in the parent
// * user can also navigate to sibling view for validator details
export const StakingOverview = (props: Props): JSX.Element => {
  const {
    navigateToValidatorDetails,
    validators,
    myValidators,
    addressesWithBalance,
  } = props;

  // we get the configurations for 2 tables that contain callbacks
  const myValidatorsConfiguration = getMyValidatorsConfiguration(
    navigateToValidatorDetails
  );
  const allValidatorsConfiguration = getAllValidatorsConfiguration(
    navigateToValidatorDetails
  );
  const totalBonded = myValidators.reduce(
    (acc, validator) => acc + Number(validator.stakedAmount),
    0
  );
  const totalBalance = addressesWithBalance.reduce((acc, curr) => {
    return acc + curr.balance["NAM"];
  }, 0);

  return (
    <StakingOverviewContainer>
      {/* my balances */}
      <StakingBalances>
        <StakingBalancesLabel>Total Balance</StakingBalancesLabel>
        <StakingBalancesValue>NAM {totalBalance}</StakingBalancesValue>

        <StakingBalancesLabel>Total Bonded</StakingBalancesLabel>
        <StakingBalancesValue>NAM {totalBonded}</StakingBalancesValue>

        <StakingBalancesLabel>Pending Rewards</StakingBalancesLabel>
        <StakingBalancesValue>TBD</StakingBalancesValue>

        <StakingBalancesLabel>Available for bonding</StakingBalancesLabel>
        <StakingBalancesValue>
          NAM {totalBalance - totalBonded}
        </StakingBalancesValue>
      </StakingBalances>

      {/* my validators */}
      <Table
        title="My Validators"
        // data={myValidatorData}
        data={myValidators}
        tableConfigurations={myValidatorsConfiguration}
      />

      {/* all validators */}
      <Table
        title="All Validators"
        data={validators}
        tableConfigurations={allValidatorsConfiguration}
      />
    </StakingOverviewContainer>
  );
};
