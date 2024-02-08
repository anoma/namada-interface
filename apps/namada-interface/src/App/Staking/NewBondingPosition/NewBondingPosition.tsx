import BigNumber from "bignumber.js";
import { useState } from "react";

import {
  ActionButton,
  Alert,
  AmountInput,
  Input,
  Stack,
  Text,
} from "@namada/components";
import {
  ChangeInStakingPosition,
  StakingPosition,
} from "slices/StakingAndGovernance";
import { Account } from "slices/accounts";
import { GAS_LIMIT } from "slices/fees";
import { BondingAddressSelect } from "./NewBondingPosition.components";

const REMAINS_BONDED_KEY = "Remains bonded";

type Props = {
  accounts: Account[];
  currentBondingPositions: StakingPosition[];
  // called when the user confirms bonding
  confirmBonding: (changeInStakingPosition: ChangeInStakingPosition) => void;
  // called when the user cancels bonding
  cancelBonding: () => void;
  minimumGasPrice: BigNumber;
  isRevealPkNeeded: (address: string) => boolean;
};

// contains everything what the user needs for bonding funds
export const NewBondingPosition = (props: Props): JSX.Element => {
  const {
    accounts,
    currentBondingPositions,
    confirmBonding,
    cancelBonding,
    minimumGasPrice,
    isRevealPkNeeded,
  } = props;

  const selectOptions = accounts
    .filter((acc) => !acc.details.isShielded)
    .map(({ details: { address, alias } }) => ({
      value: address,
      label: alias,
    }));

  const [currentAccount, setCurrentAccount] = useState<Account>(accounts[0]);
  const [memo, setMemo] = useState<string>();
  const currentAddress = currentAccount?.details.address;

  const stakedAmount = currentBondingPositions
    .filter((pos) => pos.owner === currentAddress)
    .reduce((acc, current) => acc.plus(current.stakedAmount), new BigNumber(0));

  const currentNAMBalance: BigNumber =
    currentAccount.balance["NAM"] || new BigNumber(0);

  // TODO: Expecting that these could be set by the user in the future
  const gasPrice = minimumGasPrice;
  const gasLimit = GAS_LIMIT;

  const singleTransferFee = gasPrice.multipliedBy(gasLimit);

  // gas fee for bonding tx and reveal PK tx (if needed)
  const bondingGasFee = isRevealPkNeeded(currentAddress)
    ? singleTransferFee.multipliedBy(2)
    : singleTransferFee;

  // gas fee for bonding tx and reveal PK tx (if needed) plus expected unbond and
  // withdraw gas fees in the future
  const expectedTotalGasFee = bondingGasFee.plus(
    singleTransferFee.multipliedBy(2)
  );

  const realAvailableBalance = BigNumber.maximum(
    currentNAMBalance.minus(bondingGasFee),
    0
  );

  const safeAvailableBalance = BigNumber.maximum(
    currentNAMBalance.minus(expectedTotalGasFee),
    0
  );

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

  const [amountToBond, setAmountToBond] = useState<BigNumber | undefined>();

  const showGasFeeWarning =
    typeof amountToBond !== "undefined" &&
    amountToBond.isGreaterThan(safeAvailableBalance) &&
    amountToBond.isLessThanOrEqualTo(realAvailableBalance);

  const isFormInvalid =
    typeof amountToBond === "undefined" || amountToBond.isEqualTo(0);

  // we convey this with an object that can be used
  const remainsBondedToDisplay =
    typeof amountToBond === "undefined"
      ? ""
      : stakedAmount.plus(amountToBond).toString();

  // data for the table
  const bondingSummary = [
    {
      uuid: "1",
      key: "Total Funds",
      value: `${currentNAMBalance}`,
    },
    {
      uuid: "1",
      key: "Expected gas fee",
      value: `${expectedTotalGasFee}`,
    },
    {
      uuid: "3",
      key: "Bonded amount",
      value: String(stakedAmount),
    },
    {
      uuid: "4",
      key: "Amount to bond",
      value: amountToBond?.toString(),
      hint: "stake",
    },
    {
      uuid: "5",
      key: REMAINS_BONDED_KEY,
      value: remainsBondedToDisplay,
    },
  ];

  const handleMaxButtonClick = (): void => {
    setAmountToBond(safeAvailableBalance);
  };

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

        <AmountInput
          label="Amount"
          value={amountToBond}
          onChange={(e) => setAmountToBond(e.target.value)}
          min={0}
          max={realAvailableBalance}
        />

        {showGasFeeWarning && (
          <Alert type="warning" title="Warning!">
            We recommend leaving at least {expectedTotalGasFee.toString()} in
            your account to allow for future unbond and withdraw transactions.
          </Alert>
        )}

        <ActionButton onClick={handleMaxButtonClick}>Max</ActionButton>

        <Input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          label="Memo"
        />

        <div>
          {bondingSummary.map(({ key, value }, i) => (
            <Text className="text-white" key={i}>
              {key}: {value}
            </Text>
          ))}
        </div>

        {/* confirmation and cancel */}
        <ActionButton
          onClick={() => {
            if (typeof amountToBond === "undefined") {
              return;
            }

            const changeInStakingPosition: ChangeInStakingPosition = {
              amount: amountToBond,
              owner: currentAddress,
              validatorId: currentBondingPositions[0].validatorId,
              memo,
              gasPrice,
              gasLimit,
            };
            confirmBonding(changeInStakingPosition);
          }}
          disabled={isFormInvalid}
        >
          Confirm
        </ActionButton>
        <ActionButton onClick={cancelBonding}>Cancel</ActionButton>
      </Stack>
    </div>
  );
};
