import { StakingOverviewContainer } from "./StakingOverview.components";
import {
  Table,
  TableLink,
  TableDimmedCell,
  TableConfigurations,
} from "components/Table";
import {
  MyBalanceEntry,
  Validator,
  MyValidators,
} from "slices/StakingAndGovernance";

// My Balances table row renderer and configuration
const myBalancesRowRenderer = (myBalanceEntry: MyBalanceEntry): JSX.Element => {
  return (
    <>
      <td>{myBalanceEntry.key}</td>
      <td>{myBalanceEntry.baseCurrency}</td>
      <td>
        <TableDimmedCell>{myBalanceEntry.fiatCurrency}</TableDimmedCell>
      </td>
    </>
  );
};

const myBalancesConfigurations: TableConfigurations<MyBalanceEntry, never> = {
  rowRenderer: myBalancesRowRenderer,
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "15%" },
    { uuid: "3", columnLabel: "", width: "55%" },
  ],
};

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
      <td>{myValidatorRow.stakedAmount}</td>
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
  navigateToValidatorDetails: (validatorId: string) => void;
  myBalances: MyBalanceEntry[];
  validators: Validator[];
  myValidators: MyValidators[];
};

export const StakingOverview = (props: Props): JSX.Element => {
  const { navigateToValidatorDetails, myBalances, validators, myValidators } =
    props;

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
        data={myBalances}
        tableConfigurations={myBalancesConfigurations}
      />

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
