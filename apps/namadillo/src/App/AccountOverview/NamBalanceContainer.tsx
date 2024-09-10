import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { BalanceChart } from "App/Common/BalanceChart";
import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import { useBalances } from "hooks/useBalances";
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
    <li>
      <span>
        <i className="" style={{ background: color }} />
        {title}
      </span>
      <NamCurrency amount={amount} />
    </li>
  );
};

export const NamBalanceContainer = (): JSX.Element => {
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
    <div className="flex gap-4 text-white">
      <AtomErrorBoundary
        result={[balanceQuery, stakeQuery]}
        niceError="Unable to load balances"
      >
        <BalanceChart
          view="stake"
          isLoading={isLoading}
          isSuccess={isSuccess}
          availableAmount={availableAmount}
          bondedAmount={bondedAmount}
          shieldedAmount={shieldedAmount}
          unbondedAmount={unbondedAmount}
          withdrawableAmount={withdrawableAmount}
          totalAmount={totalAmount}
        />
        <ul>
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
        </ul>
      </AtomErrorBoundary>
    </div>
  );
};
