import { KnownCurrencies } from "@namada/utils";
import BigNumber from "bignumber.js";

export type CurrencyProps = {
  amount: number | BigNumber;
  hideBalances?: boolean;
  currency: keyof typeof KnownCurrencies;
  separator?: "." | "," | "";
  spaceAroundSign?: boolean;
  currencyPosition?: "left" | "right";
  currencySignClassName?: string;
  baseAmountClassName?: string;
  fractionClassName?: string;
} & React.ComponentPropsWithoutRef<"span">;

export const Currency = ({
  amount,
  currency,
  hideBalances = false,
  currencyPosition = "left",
  separator = ".",
  className = "",
  spaceAroundSign = false,
  currencySignClassName = "",
  baseAmountClassName = "",
  fractionClassName = "",
  ...containerRest
}: CurrencyProps): JSX.Element => {
  const currencyObj = KnownCurrencies[currency];
  const amountParts = BigNumber(amount).toFormat().split(".");
  const baseAmount = hideBalances ? "✳✳✳✳" : amountParts[0] || "0";
  const fraction =
    amountParts.length > 1 && !hideBalances ? amountParts[1] : "";

  const currencyHtml = (
    <span className={currencySignClassName}>
      {spaceAroundSign && currencyPosition === "right" ? " " : null}
      {currencyObj.sign}
      {spaceAroundSign && currencyPosition === "left" ? " " : null}
    </span>
  );

  const baseAmountHtml = (
    <span className={baseAmountClassName}>{baseAmount}</span>
  );

  const fractionHtml = fraction && (
    <span className={fractionClassName}>{fraction}</span>
  );

  const amountText =
    BigNumber(baseAmount).eq(1) ? currencyObj.singular : currencyObj.plural;

  const centsText =
    BigNumber(fraction).gt(0) ? ` and ${fraction} ${currencyObj.fraction}` : "";

  const screenReaderText = `${baseAmount} ${amountText}${centsText}`;

  return (
    <span className={className} {...containerRest}>
      <span aria-hidden="true">
        {currencyPosition === "left" && currencyHtml}
        {baseAmountHtml}
        {fractionHtml ?
          <>
            {separator}
            {fractionHtml}
          </>
        : null}
        {currencyPosition === "right" && currencyHtml}
      </span>
      <span className="sr-only">{screenReaderText}</span>
    </span>
  );
};
