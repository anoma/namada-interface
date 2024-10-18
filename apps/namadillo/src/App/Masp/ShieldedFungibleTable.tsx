import { Asset } from "@chain-registry/types";
import { Balance } from "@heliaxdev/namada-sdk/web";
import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { routes } from "App/routes";
import { chainTokensAtom } from "atoms/chain";
import { knownChainsAtom } from "atoms/integrations/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { namadaAsset } from "registry/namadaAsset";
import { unknownAsset } from "registry/unknownAsset";
import { twMerge } from "tailwind-merge";

type TokenRow = {
  name: string;
  icon?: string;
  asset: Asset;
  balance: BigNumber;
  dollar: BigNumber;
  ssrRate: BigNumber;
};

const resultsPerPage = 100;
const initialPage = 0;

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
    knownChains.forEach((chain) => {
      chain.assets.assets.forEach((asset) => {
        asset.denom_units.forEach((unit) => {
          denomToAsset[unit.denom] = asset;
        });
      });
    });

    return data.map(([address, amount]) => {
      const denom = addressToDenom[address];
      const asset = denomToAsset[denom] ?? unknownAsset;
      return {
        name: asset?.symbol ?? denom ?? "?",
        icon: asset?.logo_URIs?.svg ?? asset?.logo_URIs?.png,
        asset,
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

  const renderRow = (row: TokenRow): TableRow => {
    const icon = row.asset.logo_URIs?.svg ?? row.asset.logo_URIs?.png;
    return {
      cells: [
        <div key={`token-${row.name}`} className="flex items-center gap-4">
          <div className="aspect-square w-8 h-8">
            {icon ?
              <img src={icon} />
            : <div className="rounded-full h-full border border-white" />}
          </div>
          {row.name}
        </div>,
        <div
          key={`balance-${row.name}`}
          className="flex flex-col text-right leading-tight"
        >
          <TokenCurrency asset={row.asset} amount={row.balance} />
          <FiatCurrency
            className="text-neutral-600 text-sm"
            amount={row.dollar}
          />
        </div>,
        <div key={`ssr-rate-${row.name}`} className="text-right leading-tight">
          {formatPercentage(row.ssrRate)}
        </div>,
        <ActionButton
          key={`unshield-${row.name}`}
          size="xs"
          outlineColor="white"
          className="w-fit mx-auto"
          href={row.name === "NAM" ? routes.maspUnshield : routes.ibcWithdraw}
        >
          Unshield
        </ActionButton>,
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
