import { StyledSelectBox } from "@namada/components";
import clsx from "clsx";
import { Currency } from "currencies";

type CurrencySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  currencies: Currency[];
};

export const CurrencySelector = ({
  value,
  onChange,
  currencies,
}: CurrencySelectorProps): JSX.Element => {
  const getCurrencySymbol = (symbol: string): React.ReactNode => (
    <span
      className={clsx(
        "group-hover/item:bg-cyan mr-3 w-5 h-5 rounded-full bg-yellow text-black",
        "flex justify-center items-center"
      )}
    >
      {symbol}
    </span>
  );

  return (
    <div className="text-white text-sm">
      <StyledSelectBox
        id="currency-selector"
        value={value}
        displayArrow={true}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        options={currencies.map((currency) => ({
          id: currency.currency,
          value: (
            <>
              {getCurrencySymbol(currency.symbol)} {currency.label}
            </>
          ),
          ariaLabel: currency.label,
        }))}
      />
    </div>
  );
};

export default CurrencySelector;
