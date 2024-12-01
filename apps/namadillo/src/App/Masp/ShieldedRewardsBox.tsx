import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";

type ShieldedRewardsBoxProps = {
  shieldedRewardsAmount?: BigNumber;
};

export const ShieldedRewardsBox = ({
  shieldedRewardsAmount,
}: ShieldedRewardsBoxProps): JSX.Element => {
  return (
    <div className="flex flex-col text-yellow text-sm text-center">
      <h3>Your Est. Shielding rewards per Epoch</h3>
      <div className="flex items-center justify-center text-3xl flex-1">
        {shieldedRewardsAmount === undefined ?
          <span>
            --<i className="block text-sm not-italic">NAM</i>
          </span>
        : <NamCurrency amount={shieldedRewardsAmount} decimalPlaces={2} />}
      </div>
    </div>
  );
};
