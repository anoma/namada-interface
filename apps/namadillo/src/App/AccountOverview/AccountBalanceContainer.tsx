import { Heading, Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { accountBalanceAtom } from "atoms/accounts";
import clsx from "clsx";
import { useAnimate } from "framer-motion";
import { useAtomValue } from "jotai";
import { useLayoutEffect } from "react";
import { twMerge } from "tailwind-merge";
import { easings } from "utils/animations";

export const AccountBalanceContainer = (): JSX.Element => {
  const [scope, animate] = useAnimate();
  const accountBalance = useAtomValue(accountBalanceAtom);
  const {
    data: totalBalance,
    status,
    isSuccess: balanceHasLoaded,
    isLoading: balanceIsLoading,
  } = accountBalance;

  useLayoutEffect(() => {
    if (balanceHasLoaded) {
      animate(
        scope.current,
        { minWidth: "min(90vw, 450px)" },
        { duration: 0.5, ease: easings.expoOut }
      );
      animate(
        "article",
        {
          opacity: [0, 1],
        },
        { duration: 1, ease: easings.expoOut, delay: 0.15 }
      );
    }
  }, [status]);

  return (
    <div
      ref={scope}
      className={twMerge(
        clsx(
          "flex items-center justify-center min-w-[350px]",
          "relative w-full aspect-square",
          "rounded-full border-[27px]",
          {
            "border-neutral-800 animate-pulse": balanceIsLoading,
            "border-yellow": balanceHasLoaded,
          }
        )
      )}
    >
      <AtomErrorBoundary
        result={accountBalance}
        niceError="Balance couldn't be loaded"
        containerProps={{ className: "text-white" }}
      >
        {balanceHasLoaded && totalBalance && (
          <Stack
            as="article"
            gap={0}
            className="text-neutral-400 leading-tight text-center"
          >
            <Heading level="h3" className="text-xl neutral-600">
              NAM Balance
            </Heading>
            <NamCurrency
              amount={totalBalance}
              className="text-4xl text-white font-medium"
              currencySignClassName="text-xl ml-2"
            />
          </Stack>
        )}
      </AtomErrorBoundary>
    </div>
  );
};
