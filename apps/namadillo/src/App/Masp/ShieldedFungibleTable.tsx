import { Asset } from "@chain-registry/types";
import { Balance } from "@heliaxdev/namada-sdk/web";
import { ActionButton, Currency, TableRow } from "@namada/components";
import { formatCurrency, formatPercentage } from "@namada/utils";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { routes } from "App/routes";
import { chainTokensAtom } from "atoms/chain";
import { knownChainsAtom } from "atoms/integrations/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

type TokenRow = {
  name: string;
  icon?: string;
  balance: BigNumber;
  dollar: BigNumber;
  ssrRate: BigNumber;
};

const resultsPerPage = 100;
const initialPage = 0;

const namadaAsset: Asset = {
  name: "Namada",
  base: "unam",
  display: "nam",
  symbol: "NAM",
  denom_units: [
    { denom: "unam", exponent: 0 },
    { denom: "nam", exponent: 0 },
  ],
  logo_URIs: { svg: "" },
};

const traceToDenom = (trace: string): string =>
  trace.split("/").at(-1) ?? trace;

export const ShieldedFungibleTable = ({
  data,
}: {
  data: Balance;
}): JSX.Element => {
  const [page, setPage] = useState(initialPage);
  const { data: chainTokens } = useAtomValue(chainTokensAtom);
  const knownChains = useAtomValue(knownChainsAtom);

  const list = useMemo(() => {
    const addressToDenom: Record<string, string> = {};
    chainTokens?.forEach((token) => {
      addressToDenom[token.address] =
        "trace" in token ? traceToDenom(token.trace) : "nam";
    });

    const denomToAsset: Record<string, Asset> = {
      // TODO namadaAsset should be returned from knownChains
      nam: namadaAsset,
    };
    Object.values(knownChains).forEach((chain) => {
      chain.assets.assets.forEach((asset) => {
        asset.denom_units.forEach((unit) => {
          denomToAsset[unit.denom] = asset;
        });
      });
    });

    return data.map(([address, amount]) => {
      const denom = addressToDenom[address];
      const asset = denomToAsset[denom];
      return {
        name: asset?.symbol ?? "?",
        icon: asset?.logo_URIs?.svg ?? asset?.logo_URIs?.png,
        balance: new BigNumber(amount),
        dollar: new BigNumber(0), // TODO
        ssrRate: new BigNumber(0), // TODO
      };
    });
  }, [data, chainTokens, knownChains]);

  const headers = [
    "Token",
    { children: "Balance", className: "text-right" },
    { children: "SSR Rate", className: "text-right" },
  ];

  const renderRow = (token: TokenRow): TableRow => {
    return {
      cells: [
        <div key={`token-${token.name}`} className="flex items-center gap-4">
          <div className="aspect-square w-8 h-8">
            {token.icon ?
              <img src={token.icon} />
            : <div className="rounded-full h-full border border-white" />}
          </div>
          {token.name}
        </div>,
        <div
          key={`balance-${token.name}`}
          className="flex flex-col text-right leading-tight"
        >
          <Currency
            amount={token.balance}
            currency={{ symbol: token.name }}
            currencyPosition="right"
            spaceAroundSymbol={true}
            hideBalances={false}
          />
          <span className="text-neutral-600 text-sm">
            {formatCurrency("USD", token.dollar)}
          </span>
        </div>,
        <div
          key={`ssr-rate-${token.name}`}
          className="text-right leading-tight"
        >
          {formatPercentage(token.ssrRate)}
        </div>,
        <ActionButton
          key={`unshield-${token.name}`}
          size="xs"
          outlineColor="white"
          className="w-fit mx-auto"
          href={token.name === "NAM" ? routes.maspUnshield : routes.ibcWithdraw}
        >
          Unshield
        </ActionButton>,
        <div
          key={`my-validator-currency-${token.name}`}
          className="text-right leading-tight"
        >
          <div
            className={"aspect-square w-8 rounded-full border border-white"}
          />
        </div>,
      ],
    };
  };

  useEffect(() => {
    setPage(0);
  }, [list]);

  const paginatedItems = list.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(list.length / resultsPerPage);

  return (
    <>
      <div className="text-sm font-medium mt-6">
        <span className="text-yellow">{list.length} </span>
        Tokens
      </div>
      <TableWithPaginator
        id={"my-validators"}
        headers={headers.concat("")}
        renderRow={renderRow}
        itemList={paginatedItems}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        tableProps={{
          className: twMerge(
            "w-full flex-1 [&_td]:px-1 [&_th]:px-1 [&_td:first-child]:pl-4 [&_td]:h-[64px]",
            "[&_td]:font-normal [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
            "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
            "mt-2"
          ),
        }}
        headProps={{ className: "text-neutral-500" }}
      />
    </>
  );
};
