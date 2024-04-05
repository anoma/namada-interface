import BigNumber from "bignumber.js";

export const KnownCurrencies = {
  usd: { sign: "$", singular: "dollar", plural: "dollars", fraction: "cents" },
  eur: { sign: "€", singular: "euro", plural: "euros", fraction: "cents" },
  nam: { sign: "NAM", singular: "nam", plural: "nams", fraction: "cents" },
  jpy: { sign: "¥", singular: "yen", plural: "yens", fraction: "cents" },
};

type Props = {
  amount: number | BigNumber;
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
  currencyPosition = "left",
  separator = ".",
  className = "",
  spaceAroundSign = false,
  currencySignClassName = "",
  baseAmountClassName = "",
  fractionClassName = "",
  ...containerRest
}: Props): JSX.Element => {
  const currencyObj = KnownCurrencies[currency];
  const amountParts = BigNumber(amount).toString().split(".");
  const baseAmount = amountParts[0] || "0";
  const fraction = amountParts.length > 1 ? amountParts[1] : "";

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
