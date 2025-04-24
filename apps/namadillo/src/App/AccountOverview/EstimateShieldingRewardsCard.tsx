import { NamCurrency } from "App/Common/NamCurrency";
import { cachedShieldedRewardsAtom } from "atoms/balance";
import clsx from "clsx";
import { useAtomValue } from "jotai";

export const EstimateShieldingRewardsCard = (): JSX.Element => {
  const shieldedRewards = useAtomValue(cachedShieldedRewardsAtom);

  return (
    <div
      className={clsx(
        "flex items-center gap-12 text-sm text-yellow bg-neutral-900 rounded-sm px-6",
        "py-4"
      )}
    >
      <span className="max-w-[15ch] text-center leading-tight">
        Your Est. Shielding rewards per 24hrs
      </span>
      <span className="text-3xl text-center leading-7 relative top-1">
        {shieldedRewards.amount === undefined ?
          <span>
            --<i className="block text-sm not-italic">NAM</i>
          </span>
        : <div className="flex flex-col items-center">
            <NamCurrency
              amount={shieldedRewards.amount}
              currencySymbolClassName="text-xs block"
              decimalPlaces={2}
            />
          </div>
        }
      </span>
    </div>
  );
};
