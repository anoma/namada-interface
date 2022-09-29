import { useState } from "react";
import {
  BondingPositionContainer,
  BondingAmountInputContainer,
} from "./NewBondingPosition.components";
import { Table, TableConfigurations, KeyValueData } from "components/Table";
import { Button, ButtonVariant } from "components/Button";
import {
  StakingPosition,
  ChangeInStakingPosition,
} from "slices/StakingAndGovernance";

// configuration for the summary table that represents all the data in this view
const unbondingDetailsConfigurations: TableConfigurations<KeyValueData, never> =
  {
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

type Props = {
  currentBondingPosition: StakingPosition;
  totalFundsToBond: number;
  confirmUnbonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  cancelUnbonding: () => void;
};

// contains everything what the user needs for unbonding active bonding
// positions.
export const NewBondingPosition = (props: Props): JSX.Element => {
  const {
    currentBondingPosition,
    totalFundsToBond,
    confirmUnbonding,
    cancelUnbonding,
  } = props;
  const { validatorId, stakedCurrency } = currentBondingPosition;

  // storing the unbonding input value locally here as string
  // we threat them as strings except below in validation
  // might have to change later to numbers
  const [amountToBondOrUnbond, setAmountToBondOrUnbond] = useState("");

  // unbonding amount and displayed value with a very naive validation
  // TODO (https://github.com/anoma/namada-interface/issues/4#issuecomment-1260564499)
  // do proper validation as part of input
  const bondedAmountAsNumber = Number(currentBondingPosition.stakedAmount);
  const amountToBondNumber = Number(amountToBondOrUnbond);

  const isEntryIncorrect =
    (amountToBondOrUnbond !== "" && amountToBondNumber <= 0) ||
    amountToBondNumber > totalFundsToBond ||
    Number.isNaN(amountToBondNumber);

  const isEntryIncorrectOrEmpty =
    isEntryIncorrect || amountToBondOrUnbond === "";

  // we convey this with an object that can be used
  const remainsBondedToDisplay = isEntryIncorrect
    ? `"The bonding amount can be more than 0 and at most " ${totalFundsToBond}`
    : `${bondedAmountAsNumber + amountToBondNumber}`;

  // to increase or decrease bonding, so we need to negate in case on unbind
  const amountToBond = `${amountToBondNumber}`;

  // we display one of 2 variations of the table based on if this is
  // bonding or unbonding:
  // bonding - we display value from the field above table
  // unbonding - we need a input in the table
  const unbondingSummary = [
    {
      uuid: "1",
      key: "Total Funds",
      value: `${totalFundsToBond}`,
    },
    {
      uuid: "2",
      key: "Bonded amount",
      value: currentBondingPosition.stakedAmount,
    },
    {
      uuid: "3",
      key: "Amount to bond",
      value: amountToBond,
      hint: "stake",
    },
    {
      uuid: "4",
      key: "Remains bonded",
      value: remainsBondedToDisplay,
    },
  ];

  return (
    <BondingPositionContainer>
      <BondingAmountInputContainer>
        <input
          onChange={(event) => {
            setAmountToBondOrUnbond(event.target.value);
          }}
        />
      </BondingAmountInputContainer>

      <Table
        title="Summary"
        tableConfigurations={unbondingDetailsConfigurations}
        data={unbondingSummary}
      />
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          const changeInStakingPosition: ChangeInStakingPosition = {
            amount: amountToBond,
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
    </BondingPositionContainer>
  );
};
