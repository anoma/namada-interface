import { Outlet } from "react-router-dom";
import BigNumber from "bignumber.js";

import { truncateInMiddle, formatPercentage, showMaybeNam } from "@namada/utils";
import {
  Button,
  ButtonVariant,
  Table,
  TableConfigurations,
  KeyValueData,
  TableLink,
} from "@namada/components";

import {
  ValidatorDetailsContainer,
  StakeButtonContainer,
} from "./ValidatorDetails.components";
import { Validator, StakingPosition, postNewWithdraw } from "slices/StakingAndGovernance";
import { ModalState } from "../Staking";
import { useAppSelector, RootState, useAppDispatch } from "store";

const validatorDetailsConfigurations: TableConfigurations<KeyValueData, never> =
{
  rowRenderer: (rowData: KeyValueData) => {
    // we have to figure if this is the row for validator homepage, hench an anchor
    const linkOrText = /^https?:/.test(rowData.value) ? (
      <a href={rowData.value} target="_blank" rel="noopener noreferrer">
        {rowData.value}
      </a>
    ) : (
      <span>{rowData.value}</span>
    );

    return (
      <>
        <td style={{ display: "flex" }}>{rowData.key}</td>
        <td>{linkOrText}</td>
      </>
    );
  },
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "70%" },
  ],
};

const getMyStakingWithValidatorConfigurations = (
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  navigateToUnbonding: (validatorId: string, owner: string) => void,
  dispatchWithdraw: (validatorId: string, owner: string) => void,
  epoch?: BigNumber,
): TableConfigurations<
  StakingPosition,
  {
    setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
    navigateToUnbonding: (validatorId: string, owner: string) => void;
  }
> => {
  return {
    rowRenderer: (stakingPosition: StakingPosition) => {
      return (
        <>
          <td>{truncateInMiddle(stakingPosition.owner || "", 5, 5)}</td>
          <td>{stakingPosition.bonded ? "Bonded" : "Unbonded"}</td>
          <td>
            {showMaybeNam(stakingPosition.stakedAmount)}{" "}
            {
              stakingPosition.bonded ?
                <TableLink
                  onClick={() => {
                    setModalState(ModalState.Unbond);
                    navigateToUnbonding(
                      stakingPosition.validatorId,
                      stakingPosition.owner
                    );
                  }}
                >
                  unstake
                </TableLink> :

                epoch && stakingPosition.withdrawableEpoch?.isLessThanOrEqualTo(epoch) &&
                <TableLink
                  onClick={() => dispatchWithdraw(
                    stakingPosition.validatorId,
                    stakingPosition.owner,
                  )}
                >
                  withdraw
                </TableLink>
            }
          </td>
          <td>{stakingPosition.totalRewards}</td>
        </>
      );
    },
    columns: [
      { uuid: "1", columnLabel: "Owner", width: "25%" },
      { uuid: "2", columnLabel: "State", width: "25%" },
      { uuid: "3", columnLabel: "Amount", width: "25%" },
      { uuid: "4", columnLabel: "Total Rewards", width: "25%" },
    ],
  };
};

type Props = {
  validator?: Validator;
  stakingPositionsWithSelectedValidator?: StakingPosition[];
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  navigateToUnbonding: (validatorId: string, owner: string) => void;
};

// this turns the Validator object to rows that are passed to the table
const validatorToDataRows = (
  validator?: Validator
): { uuid: string; key: string; value: string }[] => {
  if (validator === undefined) {
    return [];
  }
  return [
    { uuid: "1", key: "Name", value: truncateInMiddle(validator.name, 10, 12) },
    {
      uuid: "2",
      key: "Commission",
      value: formatPercentage(validator.commission),
    },
    { uuid: "3", key: "Voting Power", value: validator.votingPower?.toString() ?? "" },
    {
      uuid: "4",
      key: "Description",
      value: validator.description,
    },
    { uuid: "5", key: "Website", value: validator.homepageUrl },
  ];
};

export const ValidatorDetails = (props: Props): JSX.Element => {
  const {
    validator,
    setModalState,
    navigateToUnbonding,
    stakingPositionsWithSelectedValidator = [],
  } = props;

  const epoch = useAppSelector((state: RootState) =>
    state.stakingAndGovernance.epoch);

  const dispatch = useAppDispatch();
  const dispatchWithdraw = (validatorId: string, owner: string): void => {
    dispatch(postNewWithdraw({ validatorId, owner }));
  }

  const validatorDetailsData = validatorToDataRows(validator);
  const myStakingWithValidatorConfigurations =
    getMyStakingWithValidatorConfigurations(
      setModalState,
      navigateToUnbonding,
      dispatchWithdraw,
      epoch
    );

  return (
    <ValidatorDetailsContainer>
      <Table
        title="Validator Details"
        tableConfigurations={validatorDetailsConfigurations}
        data={validatorDetailsData}
      />
      <StakeButtonContainer>
        <Button
          onClick={() => {
            setModalState(ModalState.NewBonding);
          }}
          variant={ButtonVariant.Contained}
          style={{ marginLeft: "0" }}
        >
          Stake
        </Button>
      </StakeButtonContainer>

      <Table
        title={`My Staking with ${truncateInMiddle(
          validator?.name || "",
          10,
          12
        )}`}
        tableConfigurations={myStakingWithValidatorConfigurations}
        data={stakingPositionsWithSelectedValidator.filter(
          ({ stakedAmount }) => Number(stakedAmount) !== 0
        )}
      />
      <Outlet />
    </ValidatorDetailsContainer>
  );
};
