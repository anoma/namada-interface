import { Heading, Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { accountBalanceAtom } from "atoms/accounts";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";

export const AccountBalanceContainer = (): JSX.Element => {
  const accountBalance = useAtomValue(accountBalanceAtom);
  const { data: totalBalance, isSuccess: balanceHasLoaded } = accountBalance;

  return (
    <div
      className={twMerge(
        clsx(
          "flex items-center justify-center min-w-[350px]",
          "relative w-full aspect-square",
          "rounded-full border-[27px]",
          "transition-colors duration-500",
          balanceHasLoaded ? "border-yellow" : (
            "border-neutral-800 animate-pulse"
          )
        )
      )}
    >
      <AtomErrorBoundary
        result={accountBalance}
        niceError="Balance couldn't be loaded"
        containerProps={{ className: "text-white" }}
      >
        <Stack
          as="article"
          gap={0}
          className={twMerge(
            clsx(
              "text-neutral-400 leading-tight text-center",
              "transition-opacity duration-500",
              { "opacity-0": !balanceHasLoaded }
            )
          )}
        >
          <Heading level="h3" className="text-xl neutral-600">
            NAM Balance
          </Heading>
          {totalBalance && (
            <NamCurrency
              amount={totalBalance}
              className="text-4xl text-white font-medium"
              currencySymbolClassName="text-xl ml-2"
            />
          )}
        </Stack>
      </AtomErrorBoundary>
    </div>
  );
};
