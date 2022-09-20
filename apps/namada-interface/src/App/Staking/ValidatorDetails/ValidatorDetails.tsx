import { useState } from "react";
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
import { Modal } from "components/Modal";
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

const getMyStakingWithValidatorConfigurations = (
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
): TableConfigurations<
  StakingPosition,
  { setModalState: React.Dispatch<React.SetStateAction<ModalState>> }
> => {
  return {
    rowRenderer: (stakingPosition: StakingPosition) => {
      return (
        <>
          <td>{stakingPosition.stakedCurrency}</td>
          <td>{stakingPosition.stakingStatus}</td>
          <td>
            {stakingPosition.stakedAmount}{" "}
            <TableLink
              onClick={() => {
                setModalState(ModalState.Unstake);
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
      { uuid: "1", columnLabel: "Asset", width: "25%" },
      { uuid: "2", columnLabel: "State", width: "25%" },
      { uuid: "3", columnLabel: "Amount Staked", width: "25%" },
      { uuid: "4", columnLabel: "Total Rewards", width: "25%" },
    ],
  };
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

type StakingViewProps = {
  onRequestClose: (modalOnRequestCloseType: ModalOnRequestCloseType) => void;
};

const StakingView = (props: StakingViewProps): JSX.Element => {
  const { onRequestClose } = props;
  return (
    <>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => onRequestClose(ModalOnRequestCloseType.Confirm)}
      >
        Confirm
      </Button>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => onRequestClose(ModalOnRequestCloseType.Cancel)}
        style={{ backgroundColor: "lightgrey", color: "black" }}
      >
        Cancel
      </Button>
    </>
  );
};

enum ModalState {
  None,
  Stake,
  Unstake,
}

enum ModalOnRequestCloseType {
  Confirm,
  Cancel,
}

export const ValidatorDetails = (props: Props): JSX.Element => {
  const { validator, stakingPositionsWithSelectedValidator = [] } = props;
  const validatorDetailsData = validatorToDataRows(validator);

  const [modalState, setModalState] = useState(ModalState.None);

  const onRequestCloseStakingModal = (
    modalOnRequestCloseType: ModalOnRequestCloseType
  ): void => {
    switch (modalOnRequestCloseType) {
      case ModalOnRequestCloseType.Confirm: {
        console.log(`called action ${modalOnRequestCloseType}`);
        setModalState(ModalState.None);
        break;
      }
      case ModalOnRequestCloseType.Cancel: {
        console.log(`called action ${modalOnRequestCloseType}`);
        setModalState(ModalState.None);
        break;
      }
    }
  };

  const myStakingWithValidatorConfigurations =
    getMyStakingWithValidatorConfigurations(setModalState);

  return (
    <ValidatorDetailsContainer>
      <Modal
        isOpen={modalState === ModalState.Stake}
        title="Stake"
        onBackdropClick={() => {
          setModalState(ModalState.None);
        }}
      >
        <StakingView onRequestClose={onRequestCloseStakingModal} />
      </Modal>
      <Modal
        isOpen={modalState === ModalState.Unstake}
        title="Unstake"
        onBackdropClick={() => {
          setModalState(ModalState.None);
        }}
      >
        <StakingView onRequestClose={onRequestCloseStakingModal} />
      </Modal>
      <Table
        title="Validator Details"
        tableConfigurations={validatorDetailsConfigurations}
        data={validatorDetailsData}
      />
      <StakeButtonContainer>
        <Button
          onClick={() => {
            setModalState(ModalState.Stake);
          }}
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
