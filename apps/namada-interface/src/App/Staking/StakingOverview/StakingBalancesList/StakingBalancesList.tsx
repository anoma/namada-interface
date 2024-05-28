import { chains } from "@namada/chains";
import { Tokens } from "@namada/types";
import { mapUndefined, showMaybeNam } from "@namada/utils";
import BigNumber from "bignumber.js";
import { RootState, useAppSelector } from "store";
import {
  StakingBalances,
  StakingBalancesLabel,
  StakingBalancesValue,
} from "./StakingBalancesList.components";

type Totals = {
  totalBonded: BigNumber;
  totalUnbonded: BigNumber;
  totalWithdrawable: BigNumber;
};

const selectStakingTotals = (state: RootState): Totals | undefined => {
  const { myValidators } = state.stakingAndGovernance;

  if (myValidators === undefined) {
    return undefined;
  }

  const totalBonded = myValidators.reduce(
    (acc, validator) => acc.plus(validator.stakedAmount ?? 0),
    new BigNumber(0)
  );
  const totalUnbonded = myValidators.reduce(
    (acc, validator) => acc.plus(validator.unbondedAmount ?? 0),
    new BigNumber(0)
  );
  const totalWithdrawable = myValidators.reduce(
    (acc, validator) => acc.plus(validator.withdrawableAmount ?? 0),
    new BigNumber(0)
  );

  return {
    totalBonded,
    totalUnbonded,
    totalWithdrawable,
  };
};

const selectTotalNamBalance = (state: RootState): BigNumber => {
  const { derived } = state.accounts;
  const accounts = Object.values(derived[chains.namada.id]);

  return accounts.reduce((acc, curr) => {
    return acc.plus(curr.balance["NAM"] ?? new BigNumber(0));
  }, new BigNumber(0));
};

const showTotalIfDefined = (
  totals: Totals | undefined,
  key: keyof Totals
): string => showMaybeNam(mapUndefined((t) => t[key], totals));

export const StakingBalancesList: React.FC = () => {
  const totals = useAppSelector(selectStakingTotals);
  const availableForBonding = useAppSelector(selectTotalNamBalance);

  return (
    <StakingBalances>
      <StakingBalancesLabel>Available for bonding</StakingBalancesLabel>
      <StakingBalancesValue>
        {Tokens.NAM.symbol} {availableForBonding.toString()}
      </StakingBalancesValue>

      <StakingBalancesLabel>Total Bonded</StakingBalancesLabel>
      <StakingBalancesValue>
        {showTotalIfDefined(totals, "totalBonded")}
      </StakingBalancesValue>

      <StakingBalancesLabel>Total Unbonded</StakingBalancesLabel>
      <StakingBalancesValue>
        {showTotalIfDefined(totals, "totalUnbonded")}
      </StakingBalancesValue>

      <StakingBalancesLabel>Total Withdrawable</StakingBalancesLabel>
      <StakingBalancesValue>
        {showTotalIfDefined(totals, "totalWithdrawable")}
      </StakingBalancesValue>
    </StakingBalances>
  );
};
