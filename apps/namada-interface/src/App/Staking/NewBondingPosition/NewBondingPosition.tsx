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

const REMAINS_BONDED_KEY = "Remains bonded";

// configuration for the summary table that represents all the data in this view
const bondingDetailsConfigurations: TableConfigurations<KeyValueData, never> = {
  rowRenderer: (rowData: KeyValueData) => {
    // if this is the last row we style it bold
    const styleForRemainsBondedRow =
      rowData.key === REMAINS_BONDED_KEY ? { fontWeight: "bold" } : {};
    return (
      <>
        <td style={{ display: "flex", ...styleForRemainsBondedRow }}>
          {rowData.key}
        </td>
        <td style={styleForRemainsBondedRow}>{rowData.value}</td>
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
  // this is how much we have available for bonding
  totalFundsToBond: number;
  // called when the user confirms bonding
  confirmBonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  // called when the user cancels bonding
  cancelBonding: () => void;
};

// contains everything what the user needs for bonding funds
export const NewBondingPosition = (props: Props): JSX.Element => {
  const {
    currentBondingPosition,
    totalFundsToBond,
    confirmBonding,
    cancelBonding,
  } = props;
  const { validatorId, stakedCurrency } = currentBondingPosition;

  // storing the unbonding input value locally here as string
  // we threat them as strings except below in validation
  // might have to change later to numbers
  const [amountToBond, setAmountToBond] = useState("");

  // unbonding amount and displayed value with a very naive validation
  // TODO (https://github.com/anoma/namada-interface/issues/4#issuecomment-1260564499)
  // do proper validation as part of input
  const bondedAmountAsNumber = Number(currentBondingPosition.stakedAmount);
  const amountToBondNumber = Number(amountToBond);

  // if this is the case, we display error message
  const isEntryIncorrect =
    (amountToBond !== "" && amountToBondNumber <= 0) ||
    amountToBondNumber > totalFundsToBond ||
    Number.isNaN(amountToBondNumber);

  // if incorrect or empty value we disable the button
  const isEntryIncorrectOrEmpty = isEntryIncorrect || amountToBond === "";

  // we convey this with an object that can be used
  const remainsBondedToDisplay = isEntryIncorrect
    ? `The bonding amount can be more than 0 and at most ${totalFundsToBond}`
    : `${bondedAmountAsNumber + amountToBondNumber}`;

  // data for the table
  const bondingSummary = [
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
      key: REMAINS_BONDED_KEY,
      value: remainsBondedToDisplay,
    },
  ];

  return (
    <BondingPositionContainer>
      {/* input field */}
      <BondingAmountInputContainer>
        <input
          onChange={(event) => {
            setAmountToBond(event.target.value);
          }}
        />
      </BondingAmountInputContainer>

      {/* summary table */}
      <Table
        title="Summary"
        tableConfigurations={bondingDetailsConfigurations}
        data={bondingSummary}
      />

      {/* confirmation and cancel */}
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          const changeInStakingPosition: ChangeInStakingPosition = {
            amount: amountToBond,
            stakingCurrency: stakedCurrency,
            validatorId: validatorId,
          };
          confirmBonding(changeInStakingPosition);
        }}
        disabled={isEntryIncorrectOrEmpty}
      >
        Confirm
      </Button>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => {
          cancelBonding();
        }}
        style={{ backgroundColor: "lightgrey", color: "black" }}
      >
        Cancel
      </Button>
    </BondingPositionContainer>
  );
};
