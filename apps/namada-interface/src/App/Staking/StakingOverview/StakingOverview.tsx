import { StakingOverviewContainer } from "./StakingOverview.components";
import {
  Table,
  TableLink,
  TableDimmedCell,
  TableConfigurations,
} from "components/Table";

import { myBalancesData, myValidatorData } from "./fakeData";
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
const myBalancesConfigurations: TableConfigurations<MyBalanceRow, never> = {
  title: "My Balances",
  rowRenderer: myBalancesRowRenderer,
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "15%" },
    { uuid: "3", columnLabel: "", width: "55%" },
  ],
};

const MyValidatorsRowRenderer = (
  myValidatorRow: MyStaking,
  callbacks?: ValidatorsCallbacks
): JSX.Element => {
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
            callbacks && callbacks.onClickValidator(formattedValidatorName);
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

const getMyValidatorsConfiguration = (
  navigateToValidatorDetails: (validatorId: string) => void
): TableConfigurations<MyStaking, ValidatorsCallbacks> => {
  return {
    title: "My Validators",
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
    title: "All Validators",
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
  navigateToValidatorDetails: (validatorId: string) => void;
  validators: Validator[];
  ownValidators: Validator[];
};

export const StakingOverview = (props: Props): JSX.Element => {
  const { navigateToValidatorDetails, validators } = props;

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
        data={validators}
        tableConfigurations={allValidatorsConfiguration}
      />
    </StakingOverviewContainer>
  );
};
