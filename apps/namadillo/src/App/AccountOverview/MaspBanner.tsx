import { ActionButton, Panel, SkeletonLoading } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { routes } from "App/routes";
import { shieldedBalanceAtom, shieldedTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar } from "atoms/balance/functions";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";
import maspBg from "./assets/masp-bg.png";

export const MaspBanner = (): JSX.Element => {
  const { isFetching: isShieldSyncing } = useAtomValue(shieldedBalanceAtom);
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const total = getTotalDollar(shieldedTokensQuery.data);

  return (
    <Panel className="border border-yellow" title="Shielded Overview">
      <div className="p-10 pt-5 flex items-center flex-wrap gap-10 text-yellow">
        <div className="relative h-[170px] w-[170px] flex items-center justify-center">
          <img src={maspBg} className="absolute" />
          <div className="col-start-1 row-start-1 text-4xl">MASP</div>
        </div>
        <div className="flex-1">
          <div className="text-sm">Total shielded balance</div>
          {total ?
            <FiatCurrency
              className={twMerge(
                "text-4xl",
                isShieldSyncing && "animate-pulse"
              )}
              amount={total}
            />
          : <SkeletonLoading height="54px" width="120px" />}
        </div>
        <ActionButton
          size="md"
          href={routes.masp}
          className="self-end justify-end"
          outlineColor="yellow"
          backgroundColor="yellow"
          backgroundHoverColor="transparent"
          textColor="black"
          textHoverColor="yellow"
        >
          Manage your shielded assets
        </ActionButton>
      </div>
    </Panel>
  );
};
