import { Panel, Stack } from "@namada/components";
import FiatCurrency from "App/Common/FiatCurrency";
import NamCurrency from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";

type BondingAmountOverviewProps = {
  title: string;
  amountInNam: BigNumber | number;
  updatedAmountInNam?: BigNumber | number;
  amountToDelegate?: BigNumber;
  additionalText?: React.ReactNode;
  extraContent?: React.ReactNode;
  updatedValueClassList?: string;
};

export const BondingAmountOverview = ({
  title,
  amountInNam,
  updatedAmountInNam = 0,
  additionalText,
  extraContent,
  amountToDelegate,
  updatedValueClassList = "",
}: BondingAmountOverviewProps): JSX.Element => {
  const hasUpdatedValue =
    updatedAmountInNam && !new BigNumber(updatedAmountInNam).eq(amountInNam);
  const namToDisplay = hasUpdatedValue ? updatedAmountInNam : amountInNam;

  return (
    <Panel className="relative w-full rounded-md">
      <Stack gap={2} className="leading-none">
        <h3 className="text-sm">{title}</h3>
        <div className="flex items-center">
          <NamCurrency
            amount={namToDisplay}
            className={clsx("text-2xl", {
              [updatedValueClassList]: hasUpdatedValue,
            })}
            currencySignClassName="text-lg"
          />
          {amountToDelegate && amountToDelegate.gt(0) && (
            <span className="text-success text-md font-light mt-1.5 ml-3">
              (+
              <NamCurrency amount={amountToDelegate} /> Re-Delegate)
            </span>
          )}
        </div>
        <FiatCurrency
          className="text-base text-neutral-400"
          amountInNam={new BigNumber(namToDisplay)}
        />
        {additionalText && <p className="text-[10px]">{additionalText}</p>}
        {extraContent}
      </Stack>
    </Panel>
  );
};
