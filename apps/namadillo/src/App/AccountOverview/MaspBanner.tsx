import { ActionButton, Panel } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { routes } from "App/routes";
import { shieldedTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar } from "atoms/balance/functions";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";
import maspBg from "./assets/masp-bg.png";

export const MaspBanner = (): JSX.Element => {
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const total = getTotalDollar(shieldedTokensQuery.data);

  return (
    <Panel
      className={twMerge(
        "relative p-10 border border-yellow",
        "flex items-center flex-wrap gap-10",
        "text-yellow"
      )}
    >
      <div className="relative h-[170px] w-[170px] flex items-center justify-center">
        <img src={maspBg} className="absolute" />
        <div className="col-start-1 row-start-1 text-4xl">MASP</div>
      </div>
      <div className="flex-1">
        {total && total.gt(0) && (
          <>
            <div className="text-sm">Total shielded balance</div>
            <FiatCurrency className="text-4xl" amount={total} />
          </>
        )}
      </div>
      <ActionButton
        size="md"
        href={routes.masp}
        className="self-end justify-end"
      >
        Manage your shielded assets
      </ActionButton>
    </Panel>
  );
};
