import { chains } from "@namada/chains";
import { Tokens } from "@namada/types";
import { mapUndefined, showMaybeNam } from "@namada/utils";
import BigNumber from "bignumber.js";
import { RootState, useAppSelector } from "store";

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
    <div>
      <div>Available for bonding</div>
      <div>
        {Tokens.NAM.symbol} {availableForBonding.toString()}
      </div>

      <div>Total Bonded</div>
      <div>{showTotalIfDefined(totals, "totalBonded")}</div>

      <div>Total Unbonded</div>
      <div>{showTotalIfDefined(totals, "totalUnbonded")}</div>

      <div>Total Withdrawable</div>
      <div>{showTotalIfDefined(totals, "totalWithdrawable")}</div>
    </div>
  );
};
