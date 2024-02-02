import BigNumber from "bignumber.js";
import { useState } from "react";

import {
  ActionButton,
  Input,
  Stack,
  Text,
} from "@namada/components";
import {
  ChangeInStakingPosition,
  StakingPosition,
} from "slices/StakingAndGovernance";
import { Account } from "slices/accounts";
import {
  BondingAddressSelect,
} from "./NewBondingPosition.components";

const REMAINS_BONDED_KEY = "Remains bonded";

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

  const selectOptions = accounts
    .filter((acc) => !acc.details.isShielded)
    .map(({ details: { address, alias } }) => ({
      value: address,
      label: alias,
    }));

  const [currentAccount, setCurrentAccount] = useState<Account>(accounts[0]);
  const [memo, setMemo] = useState<string>();
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
    <div style={{ width: "100%", margin: "0 20px" }}>
      {/* input field */}
      <Stack gap={2} direction="vertical">
        <BondingAddressSelect
          data={selectOptions}
          value={currentAddress}
          label="Account"
          onChange={handleAddressChange}
        />

        <Input
          type="text"
          value={amountToBond}
          label="Amount"
          onChange={(e) => {
            setAmountToBond(e.target.value);
          }}
        />

        <Input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} label="Memo" />

        <div>
          {bondingSummary.map(({ key, value }, i) => <Text style={{ color: "white" }} key={i}>{key}: {value}</Text>)}
        </div>

        {/* confirmation and cancel */}
        <ActionButton
          onClick={() => {
            const changeInStakingPosition: ChangeInStakingPosition = {
              amount: amountToBondNumber,
              owner: currentAddress,
              validatorId: currentBondingPositions[0].validatorId,
              memo,
            };
            confirmBonding(changeInStakingPosition);
          }}
          disabled={isEntryIncorrectOrEmpty}
        >
          Confirm
        </ActionButton>
        <ActionButton
          onClick={() => {
            cancelBonding();
          }}
          style={{ backgroundColor: "lightgrey", color: "black" }}
        >
          Cancel
        </ActionButton>

      </Stack>
    </div>
  );
};
