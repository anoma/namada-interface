import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import BigNumber from "bignumber.js";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type MockedToken = {
  name: string;
  balance: number;
  dollar: number;
  ssrRate: number;
};

const mockData = (): AtomWithQueryResult<MockedToken[]> =>
  ({
    data: [
      {
        name: "NAM",
        balance: 9999.99,
        dollar: 9999.99,
        ssrRate: 0.99,
      },
      {
        name: "ATOM",
        balance: 9999.99,
        dollar: 9999.99,
        ssrRate: 0.99,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const resultsPerPage = 100;
const initialPage = 0;

export const ShieldedFungibleTable = (): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  // TODO
  const query = mockData();

  const list = query.data ?? [];

  const headers = [
    "Token",
    {
      children: "Balance",
      className: "text-right",
    },
    {
      children: "SSR Rate",
      className: "text-right",
    },
  ];

  const renderRow = (token: MockedToken): TableRow => {
    return {
      cells: [
        <div key={`token-${token.name}`} className="flex items-center gap-4">
          <div
            className={"aspect-square w-8 rounded-full border border-yellow"}
          />
          {token.name}
        </div>,
        <div
          key={`balance-${token.name}`}
          className="flex flex-col text-right leading-tight"
        >
          <NamCurrency amount={9999.99} />
          <span className="text-neutral-600 text-sm">$9999</span>
        </div>,
        <div
          key={`ssr-rate-${token.name}`}
          className="text-right leading-tight"
        >
          {formatPercentage(new BigNumber(0.99))}
        </div>,
        <ActionButton
          key={`unshield-${token.name}`}
          size="xs"
          outlineColor="white"
          className="w-fit mx-auto"
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
    <AtomErrorBoundary
      result={query}
      niceError="Unable to load your validators list"
      containerProps={{ className: "pb-16" }}
    >
      <ActionButton
        size="xs"
        outlineColor="white"
        className="w-fit ml-auto mt-6"
      >
        Unshield ALL
      </ActionButton>
      <div className="text-sm font-medium">
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
    </AtomErrorBoundary>
  );
};
