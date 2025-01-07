import { Heading, SkeletonLoading, Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { ShieldedRewardsBox } from "App/Masp/ShieldedRewardsBox";
import { applicationFeaturesAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useBalances } from "hooks/useBalances";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";
import { colors } from "theme";

type NamBalanceListItemProps = {
  title: string;
  color: string;
  amount: BigNumber;
  isLoading: boolean;
  isEnabled?: boolean;
};

type ListItemContainerProps = {
  isEnabled: boolean;
} & React.ComponentPropsWithoutRef<"li"> &
  React.PropsWithChildren;

const ListItemContainer = ({
  isEnabled,
  children,
  className = "",
  ...props
}: ListItemContainerProps &
  React.ComponentPropsWithoutRef<"li">): JSX.Element => {
  return (
    <li
      className={twMerge(
        clsx(
          "leading-snug bg-neutral-900 pr-6 pl-5 py-6 rounded-sm min-w-[165px]",
          { "opacity-40 pointer-events-none select-none": !isEnabled },
          className
        )
      )}
      {...props}
    >
      {children}
    </li>
  );
};

const NamBalanceListItem = ({
  title,
  color,
  amount,
  isLoading,
  isEnabled = true,
}: NamBalanceListItemProps): JSX.Element => {
  return (
    <ListItemContainer
      isEnabled={isEnabled}
      aria-description={`${title} amount is ${amount.toString()} NAM`}
    >
      <span className="flex items-center text-sm gap-1.5">
        <i
          className="w-2 h-2 rounded-full mr-1.5"
          style={{ background: color }}
        />
        {title}
      </span>
      {isLoading ?
        <SkeletonLoading height="22px" width="100px" />
      : <NamCurrency
          amount={amount}
          className="text-2xl pl-5 font-light"
          currencySymbolClassName="hidden"
          decimalPlaces={2}
        />
      }
    </ListItemContainer>
  );
};

export const NamBalanceContainer = (): JSX.Element => {
  const { maspEnabled, shieldingRewardsEnabled } = useAtomValue(
    applicationFeaturesAtom
  );

  const {
    balanceQuery,
    stakeQuery,
    isLoading,
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount,
    shieldedAmountQuery,
    shieldedNamAmount,
  } = useBalances();

  return (
    <>
      {maspEnabled && (
        <Heading className="text-sm mb-4" level="h3">
          NAM Balance
        </Heading>
      )}
      <div className="flex gap-2 w-full">
        <AtomErrorBoundary
          result={[balanceQuery, stakeQuery]}
          niceError="Unable to load balances"
        >
          <Stack
            as="ul"
            gap={2}
            className={clsx("w-full", {
              "order-1": maspEnabled && shieldingRewardsEnabled,
            })}
          >
            <NamBalanceListItem
              title="Transparent NAM"
              color={colors.balance}
              amount={availableAmount}
              isLoading={isLoading}
            />
            <NamBalanceListItem
              title="Staked NAM"
              color={colors.bond}
              amount={bondedAmount}
              isLoading={isLoading}
            />
            <NamBalanceListItem
              title="Unbonded NAM"
              color={colors.unbond}
              amount={unbondedAmount.plus(withdrawableAmount)}
              isLoading={isLoading}
            />
          </Stack>
          <Stack className="w-full" gap={2}>
            <NamBalanceListItem
              title="Shielded NAM"
              color={colors.shielded}
              amount={maspEnabled ? shieldedNamAmount : new BigNumber(0)}
              isLoading={shieldedAmountQuery.isLoading}
              isEnabled={maspEnabled}
            />
            <ListItemContainer
              isEnabled={shieldingRewardsEnabled}
              className="flex flex-1"
            >
              <ShieldedRewardsBox />
            </ListItemContainer>
          </Stack>
        </AtomErrorBoundary>
      </div>
    </>
  );
};
