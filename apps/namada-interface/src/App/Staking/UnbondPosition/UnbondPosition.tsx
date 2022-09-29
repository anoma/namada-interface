import { useState } from "react";
import {
  UnstakePositionContainer,
  BondingAmountInputContainer,
} from "./UnbondPosition.components";
import { Table, TableConfigurations, KeyValueData } from "components/Table";
import { Button, ButtonVariant } from "components/Button";
import {
  StakingPosition,
  ChangeInStakingPosition,
} from "slices/StakingAndGovernance";

// this is the key in the table
const AMOUNT_TO_UNBOND_KEY = "Amount to unbond";
const FAULTY_UNBONDING_AMOUNT_MESSAGE =
  "The unbonding amount can be more than 0 and at most";

// this is being passed into the table for being able to react to
// change in the input for unbonding amount
type UnbondingCallbacks = {
  setAmountToUnstake: React.Dispatch<React.SetStateAction<string>>;
};

// configuration for the summary table that represents all the data in this view
const unbondingDetailsConfigurations: TableConfigurations<
  KeyValueData,
  UnbondingCallbacks
> = {
  rowRenderer: (rowData: KeyValueData, callbacks?: UnbondingCallbacks) => {
    const valueOrInput =
      rowData.key === AMOUNT_TO_UNBOND_KEY ? (
        <td>
          <input
            onChange={(event) => {
              callbacks?.setAmountToUnstake(event.target.value);
            }}
          />
        </td>
      ) : (
        <td>{rowData.value}</td>
      );

    return (
      <>
        <td style={{ display: "flex" }}>{rowData.key}</td>
        {valueOrInput}
      </>
    );
  },
  columns: [
    { uuid: "1", columnLabel: "", width: "30%" },
    { uuid: "2", columnLabel: "", width: "70%" },
  ],
};

type Props = {
  confirmUnbonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  cancelUnbonding: () => void;
  currentBondingPosition: StakingPosition;
};

// contains everything what the user needs for unbonding active bonding
// positions.
export const UnbondPosition = (props: Props): JSX.Element => {
  const { currentBondingPosition, confirmUnbonding, cancelUnbonding } = props;
  const { validatorId, stakedCurrency } = currentBondingPosition;

  // storing the bonding amount input value locally here as string
  // we threat them as strings except below in validation
  // might have to change later to numbers
  const [amountToBondOrUnbond, setAmountToBondOrUnbond] = useState("");

  // configurations for the summary table
  const unbondingDetailsConfigurationsWithCallbacks: TableConfigurations<
    KeyValueData,
    UnbondingCallbacks
  > = {
    ...unbondingDetailsConfigurations,
    callbacks: {
      setAmountToUnstake: setAmountToBondOrUnbond,
    },
  };

  // unbonding amount and displayed value with a very naive validation
  // TODO (https://github.com/anoma/namada-interface/issues/4#issuecomment-1260564499)
  // do proper validation as part of input
  const bondedAmountAsNumber = Number(currentBondingPosition.stakedAmount);
  const amountToUnstakeAsNumber = Number(amountToBondOrUnbond);
  const remainsBonded = bondedAmountAsNumber - amountToUnstakeAsNumber;

  const isEntryIncorrect =
    (amountToBondOrUnbond !== "" && amountToUnstakeAsNumber <= 0) ||
    remainsBonded < 0 ||
    Number.isNaN(amountToUnstakeAsNumber);

  const isEntryIncorrectOrEmpty =
    isEntryIncorrect || amountToBondOrUnbond === "";

  // we convey this with an object that can be used
  const faultyAmountMessage = FAULTY_UNBONDING_AMOUNT_MESSAGE;
  const remainsBondedToDisplay = isEntryIncorrect
    ? `${faultyAmountMessage} ${bondedAmountAsNumber}`
    : `${remainsBonded}`;

  // to increase or decrease bonding, so we need to negate in case on unbind
  const delta = amountToUnstakeAsNumber * -1;
  const deltaAsString = `${delta}`;

  // we also use one of the keys for table based in the
  // direction (bond or unbond)
  const bondOrUnbondKeyForTable = AMOUNT_TO_UNBOND_KEY;

  // we display one of 2 variations of the table based on if this is
  // bonding or unbonding:
  // bonding - we display value from the field above table
  // unbonding - we need a input in the table
  const unbondingSummary = [
    {
      uuid: "1",
      key: "Bonded amount",
      value: currentBondingPosition.stakedAmount,
    },
    {
      uuid: "2",
      key: bondOrUnbondKeyForTable,
      value: remainsBondedToDisplay,
      hint: "stake",
    },
    {
      uuid: "3",
      key: "Remains bonded",
      value: remainsBondedToDisplay,
    },
  ];

  return (
    <UnstakePositionContainer>
      <BondingAmountInputContainer></BondingAmountInputContainer>

      <Table
        title="Summary"
        tableConfigurations={unbondingDetailsConfigurationsWithCallbacks}
        data={unbondingSummary}
      />
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          const changeInStakingPosition: ChangeInStakingPosition = {
            amount: deltaAsString,
            stakingCurrency: stakedCurrency,
            validatorId: validatorId,
          };
          confirmUnbonding(changeInStakingPosition);
        }}
        disabled={isEntryIncorrectOrEmpty}
      >
        Confirm
      </Button>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          cancelUnbonding();
        }}
        style={{ backgroundColor: "lightgrey", color: "black" }}
      >
        Cancel
      </Button>
    </UnstakePositionContainer>
  );
};
