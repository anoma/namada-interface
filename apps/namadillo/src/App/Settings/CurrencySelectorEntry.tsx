import { CurrencyInfoListItem } from "@namada/utils";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type CurrencySelectorEntryType = {
  currency: CurrencyInfoListItem;
  selected: boolean;
  onClick: () => void;
};

export const CurrencySelectorEntry = ({
  currency,
  selected,
  onClick,
}: CurrencySelectorEntryType): JSX.Element => {
  return (
    <li>
      <button
        onClick={onClick}
        className={twMerge(
          clsx(
            "w-full rounded-lg border-transparent border text-white",
            "px-6 py-6 text-base uppercase text-left bg-neutral-900 cursor-pointer",
            {
              "border-yellow": selected,
            }
          )
        )}
      >
        <span className="sr-only">{currency.plural}</span>
        {currency.id} ({currency.sign})
      </button>
    </li>
  );
};
