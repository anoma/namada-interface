import { Outlet } from "react-router-dom";

import { truncateInMiddle } from "@anoma/utils";
import {
  Button,
  ButtonVariant,
  Table,
  TableConfigurations,
  KeyValueData,
  TableLink,
} from "@anoma/components";

import {
  ValidatorDetailsContainer,
  StakeButtonContainer,
} from "./ValidatorDetails.components";
import { Validator, StakingPosition } from "slices/StakingAndGovernance";
import { ModalState } from "../Staking";

const validatorDetailsConfigurations: TableConfigurations<KeyValueData, never> =
  {
    rowRenderer: (rowData: KeyValueData) => {
      // we have to figure if this is the row for validator homepage, hench an anchor
      const linkOrText = rowData.value.startsWith("https:") ? (
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
  navigateToUnbonding: (validatorId: string, owner: string) => void
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
          <td>{stakingPosition.stakingStatus}</td>
          <td>
            NAM {stakingPosition.stakedAmount}{" "}
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
            </TableLink>
          </td>
          <td>{stakingPosition.totalRewards}</td>
        </>
      );
    },
    columns: [
      { uuid: "1", columnLabel: "Owner", width: "25%" },
      { uuid: "2", columnLabel: "State", width: "25%" },
      { uuid: "3", columnLabel: "Amount Staked", width: "25%" },
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
    { uuid: "1", key: "Name", value: truncateInMiddle(validator.name, 5, 5) },
    { uuid: "2", key: "Commission", value: validator.commission },
    { uuid: "3", key: "Voting Power", value: validator.votingPower },
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
  const validatorDetailsData = validatorToDataRows(validator);
  const myStakingWithValidatorConfigurations =
    getMyStakingWithValidatorConfigurations(setModalState, navigateToUnbonding);

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
          5,
          5
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
