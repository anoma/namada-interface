import { Stack } from "@namada/components";
import { FiatCurrencyList } from "@namada/utils";
import { selectedCurrencyAtom } from "atoms/settings";
import { useAtom } from "jotai";
import { CurrencySelectorEntry } from "./CurrencySelectorEntry";

export const CurrencySelector = (): JSX.Element => {
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom);
  return (
    <Stack as="ul" gap={2}>
      {FiatCurrencyList.map((currency) => (
        <CurrencySelectorEntry
          key={`currency-selector-${currency.id}`}
          selected={currency.id === selectedCurrency}
          currency={currency}
          onClick={() => setSelectedCurrency(currency.id)}
        />
      ))}
    </Stack>
  );
};
