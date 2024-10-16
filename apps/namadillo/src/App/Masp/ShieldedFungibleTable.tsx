import { Balance } from "@heliaxdev/namada-sdk/web";
import { ActionButton, TableRow } from "@namada/components";
import { formatCurrency, formatPercentage } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { routes } from "App/routes";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type TokenRow = {
  name: string;
  balance: BigNumber;
  dollar: BigNumber;
  ssrRate: BigNumber;
};

const tempTokenMap: Record<string, string> = {
  tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h: "NAM",
};

const resultsPerPage = 100;
const initialPage = 0;

export const ShieldedFungibleTable = ({
  data,
}: {
  data: Balance;
}): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  const list: TokenRow[] = data.map(([address, amount]) => ({
    name: tempTokenMap[address] ?? address, // TODO use the implementation from TransferModule
    balance: new BigNumber(amount),
    dollar: new BigNumber(0), // TODO
    ssrRate: new BigNumber(0), // TODO
  }));

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

  const renderRow = (token: TokenRow): TableRow => {
    return {
      cells: [
        <div key={`token-${token.name}`} className="flex items-center gap-4">
          <div className="aspect-square w-8 rounded-full border border-yellow" />
          {token.name}
        </div>,
        <div
          key={`balance-${token.name}`}
          className="flex flex-col text-right leading-tight"
        >
          <NamCurrency amount={token.balance} />
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
