import BigNumber from "bignumber.js";

export type CurrencyObject = {
  symbol: string;
  singular?: string;
  plural?: string;
  fraction?: string;
};

export type CurrencyProps = {
  amount: number | BigNumber;
  decimalPlaces?: number;
  hideBalances?: boolean;
  currency: CurrencyObject;
  separator?: "." | "," | "";
  spaceAroundSymbol?: boolean;
  currencyPosition?: "left" | "right";
  currencySymbolClassName?: string;
  baseAmountClassName?: string;
  fractionClassName?: string;
} & React.ComponentPropsWithoutRef<"span">;

export const Currency = ({
  amount,
  decimalPlaces,
  currency,
  hideBalances = false,
  currencyPosition = "left",
  separator = ".",
  className = "",
  spaceAroundSymbol = false,
  currencySymbolClassName = "",
  baseAmountClassName = "",
  fractionClassName = "",
  ...containerRest
}: CurrencyProps): JSX.Element => {
  const amountParts = BigNumber(amount).toFormat(decimalPlaces).split(".");
  const baseAmount = hideBalances ? "✳✳✳✳" : amountParts[0] || "0";
  const fraction =
    amountParts.length > 1 && !hideBalances ? amountParts[1] : "";

  const currencyHtml = (
    <span className={currencySymbolClassName}>
      {spaceAroundSymbol && currencyPosition === "right" ? " " : null}
      {currency.symbol}
      {spaceAroundSymbol && currencyPosition === "left" ? " " : null}
    </span>
  );

  const baseAmountHtml = (
    <span className={baseAmountClassName}>{baseAmount}</span>
  );

  const fractionHtml = fraction && (
    <span className={fractionClassName}>{fraction}</span>
  );

  const amountText =
    (BigNumber(baseAmount).eq(1) ? currency.singular : currency.plural) ||
    currency.symbol;

  const centsText =
    BigNumber(fraction).gt(0) ? ` and ${fraction} ${currency.fraction}` : "";

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
