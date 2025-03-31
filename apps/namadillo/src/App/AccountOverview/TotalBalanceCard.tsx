import { Stack } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";

type TotalBalanceCardProps = {
  balanceInFiat: BigNumber;
  isShielded?: boolean;
  footerButtons?: React.ReactNode;
};

export const TotalBalanceCard = ({
  balanceInFiat,
  isShielded = false,
  footerButtons,
}: TotalBalanceCardProps): JSX.Element => {
  return (
    <div className="px-7">
      <div className={clsx(isShielded ? "text-yellow" : "text-white")}>
        <header className="text-xs">
          Total {isShielded ? "Shielded" : "Unshielded"} Balance
        </header>
        <FiatCurrency className="text-5xl" amount={balanceInFiat} />
      </div>
      <Stack
        as="footer"
        direction="horizontal"
        gap={2}
        className="flex-wrap mt-4"
      >
        {footerButtons}
      </Stack>
    </div>
  );
};
