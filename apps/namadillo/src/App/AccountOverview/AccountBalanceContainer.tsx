import { Heading, Stack } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { NamCurrency } from "App/Common/NamCurrency";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { accountBalanceAtom } from "slices/accounts";
import { twMerge } from "tailwind-merge";

export const AccountBalanceContainer = (): JSX.Element => {
  const {
    data: totalBalance,
    isSuccess: balanceHasLoaded,
    isLoading: balanceIsLoading,
  } = useAtomValue(accountBalanceAtom);

  return (
    <div
      className={twMerge(
        clsx(
          "flex items-center justify-center",
          "relative w-full aspect-square",
          "rounded-full border-[27px]",
          {
            "border-neutral-800 animate-pulse": balanceIsLoading,
            "border-yellow": balanceHasLoaded,
          }
        )
      )}
    >
      {balanceHasLoaded && totalBalance && (
        <Stack gap={0} className="text-neutral-400 leading-tight text-center">
          <Heading level="h3" className="text-xl neutral-600">
            NAM Balance
          </Heading>
          <NamCurrency
            amount={totalBalance}
            className="text-5xl text-white font-medium"
            currencySignClassName="text-xl ml-2"
          />
          <FiatCurrency
            amountInNam={totalBalance}
            className="text-xl font-medium"
          />
        </Stack>
      )}
    </div>
  );
};
