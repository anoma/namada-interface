import { NewStakingPositionContainer } from "./NewStakingPosition.components";
import { Table, TableConfigurations, KeyValueData } from "components/Table";
import { Button, ButtonVariant } from "components/Button";
import { ChangeInStakingPosition } from "slices/StakingAndGovernance";

const stakingDetailsConfigurations: TableConfigurations<KeyValueData, never> = {
  rowRenderer: (rowData: KeyValueData) => {
    return (
      <>
        <td style={{ display: "flex" }}>{rowData.key}</td>
        <td>{rowData.value}</td>
      </>
    );
  },
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "70%" },
  ],
};

// this is called for both confirm and cancel. If con
type Props = {
  confirmStaking: (changeInStakingPosition: ChangeInStakingPosition) => void;
  cancelStaking: () => void;
};

// Creates a view that allows the user to create a new staking position.
// It needs the information of the users balances and the validator that
// the staking is going to be done with. This is mostly for being able
// to display a summary for the user. But also to be able to create an
// object to represent the new staking position.
export const NewStakingPosition = (props: Props): JSX.Element => {
  const { confirmStaking, cancelStaking } = props;
  return (
    <NewStakingPositionContainer>
      <Table
        title="Summary"
        tableConfigurations={stakingDetailsConfigurations}
        data={[]}
      />
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          const changeInStakingPosition: ChangeInStakingPosition = {
            amount: "1",
            stakingCurrency: "NAM",
            validatorId: "123",
          };
          confirmStaking(changeInStakingPosition);
        }}
      >
        Confirm
      </Button>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          cancelStaking();
        }}
      >
        Cancel
      </Button>
    </NewStakingPositionContainer>
  );
};
