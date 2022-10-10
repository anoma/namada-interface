import {
  ValidatorDetailsContainer,
  StakeButtonContainer,
} from "./ValidatorDetails.components";
import {
  Table,
  TableConfigurations,
  KeyValueData,
  TableLink,
} from "components/Table";
import { Button, ButtonVariant } from "components/Button";
import { Validator, StakingPosition } from "slices/StakingAndGovernance";

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

const myStakingWithValidatorConfigurations: TableConfigurations<
  StakingPosition,
  never
> = {
  rowRenderer: (stakingPosition: StakingPosition) => {
    return (
      <>
        <td>{stakingPosition.stakedCurrency}</td>
        <td>{stakingPosition.stakingStatus}</td>
        <td>
          {stakingPosition.stakedAmount}{" "}
          <TableLink
            onClick={() =>
              alert(
                `Unstake (${stakingPosition.stakedAmount} from ${stakingPosition.validatorId}). Unstaking is not implemented yet`
              )
            }
          >
            unstake
          </TableLink>
        </td>
        <td>{stakingPosition.totalRewards}</td>
      </>
    );
  },
  columns: [
    { uuid: "1", columnLabel: "Asset", width: "25%" },
    { uuid: "2", columnLabel: "State", width: "25%" },
    { uuid: "3", columnLabel: "Amount Staked", width: "25%" },
    { uuid: "4", columnLabel: "Total Rewards", width: "25%" },
  ],
};

type Props = {
  validator?: Validator;
  stakingPositionsWithSelectedValidator?: StakingPosition[];
};

// this turns the Validator object to rows that are passed to the table
const validatorToDataRows = (
  validator?: Validator
): { uuid: string; key: string; value: string }[] => {
  if (validator === undefined) {
    return [];
  }
  return [
    { uuid: "1", key: "Name", value: validator.name },
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
  const { validator, stakingPositionsWithSelectedValidator = [] } = props;
  const validatorDetailsData = validatorToDataRows(validator);

  return (
    <ValidatorDetailsContainer>
      <Table
        title="Validator Details"
        tableConfigurations={validatorDetailsConfigurations}
        data={validatorDetailsData}
      />
      <StakeButtonContainer>
        <Button
          onClick={() => alert("Staking is not implemented yet")}
          variant={ButtonVariant.Contained}
          style={{ marginLeft: "0" }}
        >
          Stake
        </Button>
      </StakeButtonContainer>

      <Table
        title={`My Staking with ${validator?.name}`}
        tableConfigurations={myStakingWithValidatorConfigurations}
        data={stakingPositionsWithSelectedValidator}
      />
    </ValidatorDetailsContainer>
  );
};
