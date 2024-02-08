import BigNumber from "bignumber.js";
import { useState } from "react";

import {
  ActionButton,
  Input,
  KeyValueData,
  Table,
  TableConfigurations,
} from "@namada/components";

import { useSanitizedParams } from "@namada/hooks";
import {
  ChangeInStakingPosition,
  StakingPosition,
} from "slices/StakingAndGovernance";
import { GAS_LIMIT } from "slices/fees";
import { UnstakePositionContainer } from "./UnbondPosition.components";

// keys for the table that we want to act upon in table configuration
const AMOUNT_TO_UNBOND_KEY = "Amount to unbond";
const REMAINS_BONDED_KEY = "Remains bonded";

// contains the callback to change unbonding amount in summary table
type UnbondingCallbacks = {
  setAmountToUnstake: React.Dispatch<React.SetStateAction<string>>;
};

// configuration for the summary table
const unbondingDetailsConfigurations: TableConfigurations<
  KeyValueData,
  UnbondingCallbacks
> = {
  rowRenderer: (rowData: KeyValueData, callbacks?: UnbondingCallbacks) => {
    const styleForRemainsBondedRow =
      rowData.key === REMAINS_BONDED_KEY ? { fontWeight: "bold" } : {};
    const valueOrInput =
      rowData.key === AMOUNT_TO_UNBOND_KEY ? (
        <td>
          <Input
            onChange={(event) => {
              callbacks?.setAmountToUnstake(event.target.value);
            }}
          />
        </td>
      ) : (
        <td style={styleForRemainsBondedRow}>{rowData.value}</td>
      );

    return (
      <>
        <td style={{ display: "flex", ...styleForRemainsBondedRow }}>
          {rowData.key}
        </td>
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
  currentBondingPositions: StakingPosition[];
  confirmUnbonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  cancelUnbonding: () => void;
  minimumGasPrice: BigNumber;
};

// contains data and controls to unbond
export const UnbondPosition = (props: Props): JSX.Element => {
  const [memo, setMemo] = useState<string>();
  const { owner } = useSanitizedParams();
  const {
    currentBondingPositions,
    confirmUnbonding,
    cancelUnbonding,
    minimumGasPrice,
  } = props;
  const currentBondingPosition = currentBondingPositions.find(
    (pos) => pos.owner === owner
  );

  const stakedAmount = new BigNumber(
    currentBondingPosition?.stakedAmount || "0"
  );

  const gasLimit = GAS_LIMIT;
  const gasPrice = minimumGasPrice;

  const gasFee = gasLimit.multipliedBy(gasPrice);

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
  const amountToUnstakeAsNumber = new BigNumber(amountToBondOrUnbond);
  const remainsBonded = stakedAmount.minus(amountToUnstakeAsNumber);

  // if the input value is incorrect we display an error
  const isEntryIncorrect =
    (amountToBondOrUnbond !== "" &&
      amountToUnstakeAsNumber.isLessThanOrEqualTo(0)) ||
    remainsBonded.isLessThan(0) ||
    amountToUnstakeAsNumber.isNaN();

  // if the input value is incorrect or empty we disable the confirm button
  const isEntryIncorrectOrEmpty =
    isEntryIncorrect || amountToBondOrUnbond === "";

  // we convey this with an object that can be used
  const remainsBondedToDisplay = isEntryIncorrect
    ? `The unbonding amount can be more than 0 and at most ${stakedAmount}`
    : `${remainsBonded}`;

  // data for the summary table
  const unbondingSummary = [
    {
      uuid: "1",
      key: "Bonded amount",
      value: String(stakedAmount),
    },
    {
      uuid: "2",
      key: AMOUNT_TO_UNBOND_KEY,
      value: "",
      hint: "stake",
    },
    {
      uuid: "3",
      key: "Remains bonded",
      value: remainsBondedToDisplay,
    },
    {
      uuid: "4",
      key: "Gas fee",
      value: gasFee.toString(),
    },
  ];

  return (
    <UnstakePositionContainer>
      {/* summary table */}
      <Table
        title="Summary"
        tableConfigurations={unbondingDetailsConfigurationsWithCallbacks}
        data={unbondingSummary}
      />
      <Input
        type="text"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        label="Memo"
      />
      {/* confirm and cancel buttons */}
      <ActionButton
        onClick={() => {
          const changeInStakingPosition: ChangeInStakingPosition = {
            amount: amountToUnstakeAsNumber,
            owner: owner as string,
            validatorId: currentBondingPositions[0].validatorId,
            memo,
            gasLimit,
            gasPrice,
          };
          confirmUnbonding(changeInStakingPosition);
        }}
        disabled={isEntryIncorrectOrEmpty}
      >
        Confirm
      </ActionButton>
      <ActionButton onClick={cancelUnbonding}>Cancel</ActionButton>
    </UnstakePositionContainer>
  );
};
