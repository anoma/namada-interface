import { StyledSelectBox } from "@namada/components";
import { CurrencyInfoListItem } from "@namada/utils";
import clsx from "clsx";

type CurrencySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencyInfoListItem[];
};

export const CurrencySelector = ({
  value,
  onChange,
  currencies,
}: CurrencySelectorProps): JSX.Element => {
  const getCurrencySymbol = (symbol: string): React.ReactNode => (
    <span
      className={clsx(
        "group-hover/item:bg-cyan w-5 h-5 rounded-full bg-yellow text-black",
        "flex justify-center items-center md:mr-3 "
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
        containerProps={{
          className: "[&_.currency-name]:hidden md:[&_.currency-name]:inline",
        }}
        onChange={(e) => onChange(e.target.value)}
        options={currencies.map((currency) => ({
          id: currency.id,
          value: (
            <>
              {getCurrencySymbol(currency.sign)}{" "}
              <span className="currency-name">{currency.plural}</span>
            </>
          ),
          ariaLabel: currency.plural,
        }))}
      />
    </div>
  );
};
