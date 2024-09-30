import { Panel, Stack } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
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
  className?: string;
  stackClassName?: string;
};

export const BondingAmountOverview = ({
  title,
  amountInNam,
  updatedAmountInNam = 0,
  additionalText,
  extraContent,
  amountToDelegate,
  updatedValueClassList = "",
  className,
  stackClassName,
}: BondingAmountOverviewProps): JSX.Element => {
  const hasUpdatedValue =
    updatedAmountInNam && !new BigNumber(updatedAmountInNam).eq(amountInNam);
  const namToDisplay = hasUpdatedValue ? updatedAmountInNam : amountInNam;

  return (
    <Panel className={clsx("relative flex-1 rounded-md", className)}>
      <Stack gap={2} className={clsx("leading-none", stackClassName)}>
        <h3 className="text-sm whitespace-nowrap">{title}</h3>
        <div className="flex items-center">
          <NamCurrency
            amount={namToDisplay}
            className={clsx("text-2xl", {
              [updatedValueClassList]: hasUpdatedValue,
            })}
            currencySymbolClassName="text-lg"
          />
          {amountToDelegate && amountToDelegate.gt(0) && (
            <span className="text-success text-md font-light mt-1.5 ml-3">
              (+
              <NamCurrency amount={amountToDelegate} /> Redelegate)
            </span>
          )}
        </div>
        {additionalText && <p className="text-[10px]">{additionalText}</p>}
        {extraContent}
      </Stack>
    </Panel>
  );
};
