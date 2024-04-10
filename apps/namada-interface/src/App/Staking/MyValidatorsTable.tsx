import { Table, TableConfigurations, TableLink } from "@namada/components";
import { showMaybeNam, truncateInMiddle } from "@namada/utils";
import {
  MyValidators,
  StakingAndGovernanceState,
} from "slices/StakingAndGovernance";
import { useAppSelector } from "store";
import { ValidatorsCallbacks } from "./StakingOverview";

const MyValidatorsRowRenderer = (
  myValidatorRow: MyValidators,
  callbacks?: ValidatorsCallbacks
): JSX.Element => {
  return (
    <>
      <td>
        <TableLink
          onClick={() => {
            // this function is defined at <Staking />
            // there it triggers a navigation. It then calls a callback
            // that was passed to it by its' parent <StakingAndGovernance />
            // in that callback function that is defined in <StakingAndGovernance />
            // an action is dispatched to fetch validator data and make in available
            callbacks &&
              callbacks.onClickValidator(myValidatorRow.validator.name);
          }}
        >
          {truncateInMiddle(myValidatorRow.validator.name, 10, 12)}
        </TableLink>
      </td>
      <td>{myValidatorRow.stakingStatus}</td>
      <td>{showMaybeNam(myValidatorRow.stakedAmount)}</td>
      <td>{showMaybeNam(myValidatorRow.unbondedAmount)}</td>
      <td>{showMaybeNam(myValidatorRow.withdrawableAmount)}</td>
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
      { uuid: "2", columnLabel: "Status", width: "20%" },
      { uuid: "3", columnLabel: "Staked Amount", width: "30%" },
      { uuid: "4", columnLabel: "Unbonded Amount", width: "30%" },
      { uuid: "5", columnLabel: "Withdrawable Amount", width: "30%" },
    ],
    callbacks: {
      onClickValidator: navigateToValidatorDetails,
    },
  };
};

export const MyValidatorsTable: React.FC<{
  navigateToValidatorDetails: (validatorId: string) => void;
}> = ({ navigateToValidatorDetails }) => {
  const stakingAndGovernanceState = useAppSelector<StakingAndGovernanceState>(
    (state) => state.stakingAndGovernance
  );
  const myValidators = stakingAndGovernanceState.myValidators ?? [];

  const myValidatorsConfiguration = getMyValidatorsConfiguration(
    navigateToValidatorDetails
  );

  return (
    <Table
      title="My Validators"
      data={myValidators}
      tableConfigurations={myValidatorsConfiguration}
    />
  );
};
