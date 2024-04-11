import { useEffect, useState } from "react";

import { GapPatterns, Stack, TickedRadioList } from "@namada/components";
import { FiatCurrency } from "@namada/types";
import { PageHeader } from "App/Common";

import { ExtensionKVStore } from "@namada/storage";
import { KVPrefix } from "router/types";
import { LocalStorage } from "storage";
import browser from "webextension-polyfill";

const localStorage = new LocalStorage(
  new ExtensionKVStore(KVPrefix.LocalStorage, {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  })
);

const FIAT_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "PLN", symbol: "zł" },
  { code: "BRL", symbol: "R$" },
  { code: "PHP", symbol: "₱" },
  { code: "JPY", symbol: "¥" },
] as const satisfies readonly FiatCurrency[];

const fiatCodes = FIAT_CURRENCIES.map((fc) => fc.code);
type FiatCode = (typeof fiatCodes)[number]; // "USD" | "EUR" | ...

const isFiatCode = (str: string): str is FiatCode =>
  fiatCodes.includes(str as FiatCode);

/**
 * Represents the extension's currency select page.
 */
export const Currency = (): JSX.Element => {
  const [value, setValue] = useState<FiatCode>("USD");

  const options = FIAT_CURRENCIES.map(({ code, symbol }) => ({
    text: `${code} (${symbol})`,
    value: code,
  }));

  const handleChange = async (fiatCode: string): Promise<void> => {
    if (!isFiatCode(fiatCode)) {
      throw new Error("change value is not a known fiat code");
    }
    await localStorage.setFiatCurrency(fiatCode);
    setValue(fiatCode);
  };

  useEffect(() => {
    void (async () => {
      const fiatCode = await localStorage.getFiatCurrency();

      if (typeof fiatCode === "undefined") {
        return;
      }

      if (!isFiatCode(fiatCode)) {
        throw new Error("unknown fiat code read from storage");
      }

      setValue(fiatCode);
    })();
  }, []);

  return (
    <Stack full gap={GapPatterns.TitleContent}>
      <PageHeader title="Select Currency" />

      <TickedRadioList<FiatCode>
        id="currency-list"
        options={options}
        value={value}
        onChange={handleChange}
      />
    </Stack>
  );
};
