import { useState } from "react";
import BigNumber from "bignumber.js";

import {
  BondingPositionContainer,
  BondingAmountInputContainer,
  BondingAddressSelect,
  NewBondingTable,
} from "./NewBondingPosition.components";
import {
  Button,
  ButtonVariant,
  TableConfigurations,
  KeyValueData,
} from "@namada/components";
import { truncateInMiddle } from "@namada/utils";
import {
  StakingPosition,
  ChangeInStakingPosition,
} from "slices/StakingAndGovernance";
import { Account } from "slices/accounts";

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
  accounts: Account[];
  currentBondingPositions: StakingPosition[];
  // called when the user confirms bonding
  confirmBonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  // called when the user cancels bonding
  cancelBonding: () => void;
};

// contains everything what the user needs for bonding funds
export const NewBondingPosition = (props: Props): JSX.Element => {
  const { accounts, currentBondingPositions, confirmBonding, cancelBonding } =
    props;

  const selectOptions = accounts.map(({ details: { address } }) => ({
    value: address,
    label: truncateInMiddle(address, 9, 9),
  }));

  const [currentAccount, setCurrentAccount] = useState<Account>(accounts[0]);
  const currentAddress = currentAccount?.details.address;

  const currentBondingPosition = currentBondingPositions.find(
    (pos) => pos.owner === currentAccount?.details.address
  );
  const stakedAmount: BigNumber = new BigNumber(
    currentBondingPosition?.stakedAmount || "0"
  );
  const currentNAMBalance: BigNumber =
    currentAccount.balance["NAM"] || new BigNumber(0);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const targetAddress = e.target.value;
    const account = accounts.find(
      ({ details: { address } }) => targetAddress === address
    );
    if (account) {
      setCurrentAccount(account);
    }
  };

  // storing the unbonding input value locally here as string
  // we threat them as strings except below in validation
  // might have to change later to numbers
  const [amountToBond, setAmountToBond] = useState("");

  // unbonding amount and displayed value with a very naive validation
  // TODO (https://github.com/anoma/namada-interface/issues/4#issuecomment-1260564499)
  // do proper validation as part of input
  const amountToBondNumber = new BigNumber(amountToBond);

  // if this is the case, we display error message
  const isEntryIncorrect =
    (amountToBond !== "" && amountToBondNumber.isLessThanOrEqualTo(0)) ||
    amountToBondNumber.isGreaterThan(currentNAMBalance) ||
    amountToBondNumber.isNaN();

  // if incorrect or empty value we disable the button
  const isEntryIncorrectOrEmpty = isEntryIncorrect || amountToBond === "";

  // we convey this with an object that can be used
  const remainsBondedToDisplay = isEntryIncorrect
    ? `The bonding amount can be more than 0 and at most ${currentNAMBalance}`
    : `${stakedAmount.plus(amountToBondNumber).toString()}`;

  // data for the table
  const bondingSummary = [
    {
      uuid: "1",
      key: "Total Funds",
      value: `${currentNAMBalance}`,
    },
    {
      uuid: "2",
      key: "Bonded amount",
      value: String(stakedAmount),
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
        Value
        <input
          onChange={(event) => {
            setAmountToBond(event.target.value);
          }}
        />
      </BondingAmountInputContainer>

      <BondingAddressSelect
        data={selectOptions}
        value={currentAddress}
        label="Address"
        onChange={handleAddressChange}
      />

      {/* summary table */}
      <NewBondingTable
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
            owner: currentAddress,
            validatorId: currentBondingPositions[0].validatorId,
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
