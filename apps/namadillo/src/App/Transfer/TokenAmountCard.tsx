import { Asset } from "@chain-registry/types";
import { TokenCurrency } from "App/Common/TokenCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { getAssetImageUrl } from "integrations/utils";

type TokenAmountCardProps = {
  asset: Asset;
  amount: BigNumber;
  isShielded?: boolean;
};

export const TokenAmountCard = ({
  asset,
  amount,
}: TokenAmountCardProps): JSX.Element => {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <i>
        <img
          src={getAssetImageUrl(asset)}
          alt={asset.name}
          className={clsx(
            "w-15 aspect-square object-cover object-center rounded-full"
          )}
        />
      </i>
      <TokenCurrency
        amount={amount}
        symbol={asset.symbol}
        className="text-xl"
      />
    </div>
  );
};
