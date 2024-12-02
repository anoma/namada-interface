import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { params, routes } from "App/routes";
import { TokenBalance } from "atoms/balance/atoms";
import { getAssetImageUrl } from "integrations/utils";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const resultsPerPage = 100;
const initialPage = 0;

export const ShieldedFungibleTable = ({
  data,
}: {
  data: TokenBalance[];
}): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  const headers = [
    "Token",
    { children: "Balance", className: "text-right" },
    { children: "SSR Rate", className: "text-right" },
  ];

  const renderRow = ({
    originalAddress,
    asset,
    amount,
    dollar,
  }: TokenBalance): TableRow => {
    const icon = getAssetImageUrl(asset);

    // TODO
    const ssrRate = undefined;

    return {
      cells: [
        <div
          key={`token-${originalAddress}`}
          className="flex items-center gap-4"
        >
          <div className="aspect-square w-8 h-8">
            {icon ?
              <img src={icon} />
            : <div className="rounded-full h-full border border-white" />}
          </div>
          {asset.symbol}
        </div>,
        <div
          key={`balance-${originalAddress}`}
          className="flex flex-col text-right leading-tight"
        >
          <TokenCurrency symbol={asset.symbol} amount={amount} />
          {dollar && (
            <FiatCurrency
              className="text-neutral-600 text-sm"
              amount={dollar}
            />
          )}
        </div>,
        <div
          key={`ssr-rate-${originalAddress}`}
          className="text-right leading-tight"
        >
          {ssrRate && formatPercentage(ssrRate)}
        </div>,
        <ActionButton
          key={`unshield-${originalAddress}`}
          size="xs"
          outlineColor="white"
          className="w-fit mx-auto"
          href={`${routes.maspUnshield}?${params.asset}=${originalAddress}`}
        >
          Unshield
        </ActionButton>,
      ],
    };
  };

  useEffect(() => {
    setPage(0);
  }, [data]);

  const paginatedItems = data.slice(
    page * resultsPerPage,
    page * resultsPerPage + resultsPerPage
  );

  const pageCount = Math.ceil(data.length / resultsPerPage);

  return (
    <>
      <div className="text-sm font-medium">
        <span className="text-yellow">{data.length} </span>
        Tokens
      </div>
      <TableWithPaginator
        id="shielded-tokens"
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
