import {
  ActionButton,
  Panel,
  SkeletonLoading,
  TableRow,
} from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { routes } from "App/routes";
import { TokenBalance, transparentTokensAtom } from "atoms/balance/atoms";
import { getAssetImageUrl } from "integrations/utils";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const resultsPerPage = 100;
const initialPage = 0;

const TransparentTokensTable = ({
  data,
}: {
  data: TokenBalance[];
}): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  const headers = ["Token", { children: "Balance", className: "text-right" }];

  const renderRow = ({ asset, balance, dollar }: TokenBalance): TableRow => {
    const display = asset.display;
    const icon = getAssetImageUrl(asset);

    return {
      cells: [
        <div key={`token-${display}`} className="flex items-center gap-4">
          <div className="aspect-square w-8 h-8">
            {icon ?
              <img src={icon} />
            : <div className="rounded-full h-full border border-white" />}
          </div>
          {display.toUpperCase()}
        </div>,
        <div
          key={`balance-${display}`}
          className="flex flex-col text-right leading-tight"
        >
          <TokenCurrency asset={asset} amount={balance} />
          {dollar && (
            <FiatCurrency
              className="text-neutral-600 text-sm"
              amount={dollar}
            />
          )}
        </div>,
        <div
          key={`buttons-${display}`}
          className="flex items-center justify-end gap-1"
        >
          <ActionButton size="xs" href={routes.maspShield}>
            Shield
          </ActionButton>
          {display === "nam" && (
            <ActionButton
              size="xs"
              className="w-fit mx-auto"
              backgroundColor="cyan"
              outlineColor="cyan"
              textColor="black"
              textHoverColor="cyan"
              backgroundHoverColor="transparent"
              href={routes.stakingBondingIncrement}
            >
              Stake
            </ActionButton>
          )}
        </div>,
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
      <div className="text-sm font-medium mt-6">
        <span className="text-yellow">{data.length} </span>
        Tokens
      </div>
      <TableWithPaginator
        id={"transparent-tokens"}
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

export const TransparentOverviewPanel = (): JSX.Element => {
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);

  return (
    <Panel className="min-h-[350px]" title="Transparent Overview">
      {transparentTokensQuery.isPending ?
        <SkeletonLoading height="100%" width="100%" />
      : <AtomErrorBoundary
          result={transparentTokensQuery}
          niceError="Unable to load your transparent balance"
          containerProps={{ className: "pb-16" }}
        >
          <div className="flex flex-col gap-2">
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                {
                  title: "Total Transparent Asset Balance",
                  amount: 0,
                },
                {
                  title: "Transparent NAM Balance",
                  amount: 0,
                },
              ].map(({ title, amount }) => (
                <div key={title} className="bg-gray px-6 py-3 rounded-sm">
                  <div className="text-sm">{title}</div>
                  <FiatCurrency
                    className="text-2xl sm:text-3xl whitespace-nowrap"
                    amount={amount}
                  />
                </div>
              ))}
            </div>
            {transparentTokensQuery.data?.length ?
              <TransparentTokensTable data={transparentTokensQuery.data} />
            : <div className="bg-neutral-900 p-6 rounded-sm text-center font-medium mt-10">
                You currently hold no assets in your unshielded account
              </div>
            }
          </div>
        </AtomErrorBoundary>
      }
    </Panel>
  );
};
