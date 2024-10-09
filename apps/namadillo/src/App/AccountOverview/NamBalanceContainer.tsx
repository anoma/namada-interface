import { Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { BalanceChart } from "App/Common/BalanceChart";
import { NamCurrency } from "App/Common/NamCurrency";
import { applicationFeaturesAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useBalances } from "hooks/useBalances";
import { useAtomValue } from "jotai";
import { colors } from "theme";

type NamBalanceListItemProps = {
  title: string;
  color: string;
  amount: BigNumber;
};

const NamBalanceListItem = ({
  title,
  color,
  amount,
}: NamBalanceListItemProps): JSX.Element => {
  return (
    <li
      className="leading-5 bg-neutral-900 px-4 py-3 rounded-sm min-w-[165px]"
      aria-description={`${title} amount is ${amount.toString()} NAM`}
    >
      <span className="flex items-center text-xs gap-1.5">
        <i className="w-2 h-2 rounded-full" style={{ background: color }} />
        {title}
      </span>
      <NamCurrency
        amount={amount}
        className="text-lg pl-3.5"
        currencySymbolClassName="hidden"
      />
    </li>
  );
};

export const NamBalanceContainer = (): JSX.Element => {
  const features = useAtomValue(applicationFeaturesAtom);
  const {
    balanceQuery,
    stakeQuery,
    isLoading,
    isSuccess,
    availableAmount,
    bondedAmount,
    shieldedAmount,
    unbondedAmount,
    withdrawableAmount,
    totalAmount,
  } = useBalances();

  return (
    <div className="flex gap-4 text-white pl-4 pr-6 py-5">
      <AtomErrorBoundary
        result={[balanceQuery, stakeQuery]}
        niceError="Unable to load balances"
      >
        <div className="flex items-center w-full">
          <BalanceChart
            view="total"
            isLoading={isLoading}
            isSuccess={isSuccess}
            availableAmount={availableAmount}
            bondedAmount={bondedAmount}
            shieldedAmount={shieldedAmount}
            unbondedAmount={unbondedAmount}
            withdrawableAmount={withdrawableAmount}
            totalAmount={totalAmount}
          />
          <Stack gap={2} as="ul">
            {features.maspEnabled && (
              <NamBalanceListItem
                title="Shielded Assets"
                color={colors.shielded}
                amount={shieldedAmount}
              />
            )}
            <NamBalanceListItem
              title="Available NAM"
              color={colors.balance}
              amount={availableAmount}
            />
            <NamBalanceListItem
              title="Staked NAM"
              color={colors.bond}
              amount={bondedAmount}
            />
            <NamBalanceListItem
              title="Unbonded NAM"
              color={colors.unbond}
              amount={unbondedAmount.plus(withdrawableAmount)}
            />
          </Stack>
        </div>
      </AtomErrorBoundary>
    </div>
  );
};
