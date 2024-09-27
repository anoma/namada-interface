import { SkeletonLoading, Stack, Tooltip } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import { useBalances } from "hooks/useBalances";
import { GoInfo } from "react-icons/go";
import { twMerge } from "tailwind-merge";
import namBalanceIcon from "./assets/nam-balance-icon.png";
import namadaShieldedSvg from "./assets/namada-shielded.svg";

const AsyncNamCurrency = ({
  isLoading,
  amount,
}: {
  isLoading: boolean;
  amount: BigNumber;
}): JSX.Element => {
  if (isLoading) {
    return (
      <Stack gap={2.5} className="h-[76px] items-center">
        <SkeletonLoading height="26px" width="100px" />
        <SkeletonLoading height="16px" width="50px" />
      </Stack>
    );
  }

  return (
    <NamCurrency
      amount={amount}
      className="block text-center text-3xl leading-none"
      currencySignClassName="block text-xs mt-1"
    />
  );
};

export const ShieldedNamBalance = (): JSX.Element => {
  const { isLoading } = useBalances();

  return (
    <AtomErrorBoundary
      // TODO shieldedQuery
      result={[]}
      niceError="Unable to load shielded NAM balance"
    >
      <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr] gap-2 min-h-full text-yellow">
        <div
          className={twMerge("relative", "flex flex-col gap-4 justify-between")}
        >
          <div className="absolute -top-3 -left-2 group/tooltip">
            <GoInfo />
            <Tooltip className="w-[360px] z-40">
              Shielded rewards accrue each epoch and are added to your NAM
              shielded balance automatically based on the amount of assets you
              have shielded
            </Tooltip>
          </div>
          <div className="flex flex-col items-center gap-1 text-sm text-center font-medium">
            <div className="relative mt-6">
              <img src={namBalanceIcon} />
              <img
                src={namadaShieldedSvg}
                className="absolute top-[20%] left-[20%] w-[60%] h-[60%]"
              />
            </div>
          </div>
          <AsyncNamCurrency
            isLoading={isLoading}
            amount={new BigNumber(9999)}
          />
          <div
            className={twMerge(
              "py-2 max-w-[160px] mx-auto mt-4 mb-3",
              "text-sm text-center"
            )}
          >
            Total Shielded NAM Balance
          </div>
        </div>

        <div
          className={twMerge(
            "relative",
            "flex flex-col gap-4 justify-between",
            "rounded-sm bg-neutral-900 p-4 "
          )}
        >
          <div className="absolute top-2 right-2 group/tooltip">
            <GoInfo />
            <Tooltip className="w-[300px]">
              Estimated rewards you will receive aprox. every 6 hours based on
              the amount of assets you hold in the shield pool
            </Tooltip>
          </div>
          <div
            className={twMerge(
              "text-sm text-center font-medium",
              "flex items-center justify-center py-4"
            )}
          >
            Your Est. Shielded
            <br />
            rewards per Epoch
          </div>
          <AsyncNamCurrency
            isLoading={isLoading}
            amount={new BigNumber(9999)}
          />
          <div
            className={twMerge(
              "border border-white rounded-md py-2 max-w-[200px] mx-auto mt-4",
              "text-white text-xs text-center"
            )}
          >
            Shielding more assets will increase your rewards
          </div>
        </div>
      </div>
    </AtomErrorBoundary>
  );
};
