import { SkeletonLoading, Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { NamCurrency } from "App/Common/NamCurrency";
import { shieldedTokensAtom, transparentTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar, getTotalNam } from "atoms/balance/functions";
import { getStakingTotalAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { colors } from "theme";

type ItemProps = {
  title: string;
  color: string;
  isLoading: boolean;
  children?: ReactNode;
};

const Item = ({
  title,
  color,
  isLoading,
  children,
}: ItemProps): JSX.Element => {
  return (
    <li className="leading-5 bg-neutral-900 px-4 py-3 rounded-sm min-w-[165px] flex justify-between">
      <span className="flex items-center text-xs gap-1.5">
        <i className="w-2 h-2 rounded-full" style={{ background: color }} />
        {title}
      </span>
      <div className="text-lg pl-3.5">
        {isLoading ?
          <SkeletonLoading height="22px" width="80px" />
        : children}
      </div>
    </li>
  );
};

const DollarItem = ({
  dollar,
  ...props
}: {
  dollar?: BigNumber;
} & ItemProps): JSX.Element => {
  return (
    <Item {...props}>
      {dollar ?
        <FiatCurrency amount={dollar} />
      : "N/A"}
    </Item>
  );
};

const NamItem = ({
  nam,
  ...props
}: { nam?: BigNumber } & ItemProps): JSX.Element => {
  return (
    <Item {...props}>
      {nam ?
        <NamCurrency amount={nam} currencySymbolClassName="hidden" />
      : "N/A"}
    </Item>
  );
};

export const BalanceContainer = (): JSX.Element => {
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);
  const stakingTotalQuery = useAtomValue(getStakingTotalAtom);

  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);
  const shieldedNam = getTotalNam(shieldedTokensQuery.data);

  const transparentDollars = getTotalDollar(transparentTokensQuery.data);
  const transparentNam = getTotalNam(transparentTokensQuery.data);

  const bondedAmount = stakingTotalQuery.data?.totalBonded;
  const unbondedAmount = stakingTotalQuery.data?.totalUnbonded;
  const withdrawableAmount = stakingTotalQuery.data?.totalWithdrawable;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <AtomErrorBoundary
        result={[
          shieldedTokensQuery,
          transparentTokensQuery,
          stakingTotalQuery,
        ]}
        niceError="Unable to load balances"
      >
        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center justify-center w-full">
          <Stack gap={2} as="ul" className=" w-full">
            <DollarItem
              title="Shielded Assets"
              color={colors.shielded}
              dollar={shieldedDollars}
              isLoading={shieldedTokensQuery.isPending}
            />
            <NamItem
              title="Shielded NAM"
              color={colors.shielded}
              nam={shieldedNam}
              isLoading={shieldedTokensQuery.isPending}
            />
            <DollarItem
              title="Transparent Assets"
              color={colors.balance}
              dollar={transparentDollars}
              isLoading={transparentTokensQuery.isPending}
            />
            <NamItem
              title="Transparent NAM"
              color={colors.balance}
              nam={transparentNam}
              isLoading={transparentTokensQuery.isPending}
            />

            <NamItem
              title="Staked NAM"
              color={colors.bond}
              nam={bondedAmount}
              isLoading={stakingTotalQuery.isPending}
            />
            <NamItem
              title="Unbonding NAM"
              color={colors.unbond}
              nam={
                unbondedAmount && withdrawableAmount ?
                  unbondedAmount.plus(withdrawableAmount)
                : undefined
              }
              isLoading={stakingTotalQuery.isPending}
            />
          </Stack>
        </div>
      </AtomErrorBoundary>
    </div>
  );
};
