import BigNumber from "bignumber.js";
import {
  StakingBalances,
  StakingBalancesLabel,
  StakingBalancesValue,
} from "./StakingBalancesList.components";
import { showMaybeNam, mapUndefined } from "@namada/utils";
import { useAppSelector, RootState } from "store";

type Totals = {
  totalBonded: BigNumber,
  totalUnbonded: BigNumber,
  totalWithdrawable: BigNumber,
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
  const { chainId } = state.settings;
  const { derived } = state.accounts;
  const accounts = Object.values(derived[chainId]);

  return accounts.reduce((acc, curr) => {
    return acc.plus(curr.balance["NAM"] ?? new BigNumber(0));
  }, new BigNumber(0));
};

const showTotalIfDefined = (totals: Totals | undefined, key: keyof Totals): string =>
  showMaybeNam(mapUndefined(t => t[key], totals));

export const StakingBalancesList: React.FC = () => {
  const totals = useAppSelector(selectStakingTotals);
  const availableForBonding = useAppSelector(selectTotalNamBalance);

  return (
    <StakingBalances>
      <StakingBalancesLabel>Available for bonding</StakingBalancesLabel>
      <StakingBalancesValue>NAM {availableForBonding.toString()}</StakingBalancesValue>

      <StakingBalancesLabel>Total Bonded</StakingBalancesLabel>
      <StakingBalancesValue>{showTotalIfDefined(totals, "totalBonded")}</StakingBalancesValue>

      <StakingBalancesLabel>Total Unbonded</StakingBalancesLabel>
      <StakingBalancesValue>{showTotalIfDefined(totals, "totalUnbonded")}</StakingBalancesValue>

      <StakingBalancesLabel>Total Withdrawable</StakingBalancesLabel>
      <StakingBalancesValue>{showTotalIfDefined(totals, "totalWithdrawable")}</StakingBalancesValue>

      <StakingBalancesLabel>Pending Rewards</StakingBalancesLabel>
      <StakingBalancesValue>TBD</StakingBalancesValue>
    </StakingBalances>
  );
};
