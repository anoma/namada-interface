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
import { params, routes } from "App/routes";
import { TokenBalance, transparentTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar } from "atoms/balance/functions";
import { getAssetImageUrl } from "integrations/utils";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { isNamadaAsset } from "utils";

const resultsPerPage = 100;
const initialPage = 0;

const TransparentTokensTable = ({
  data,
}: {
  data: TokenBalance[];
}): JSX.Element => {
  const [page, setPage] = useState(initialPage);

  const headers = ["Token", { children: "Balance", className: "text-right" }];

  const renderRow = ({
    originalAddress,
    asset,
    amount,
    dollar,
  }: TokenBalance): TableRow => {
    const icon = getAssetImageUrl(asset);

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
          key={`buttons-${originalAddress}`}
          className="flex items-center justify-end gap-1"
        >
          <ActionButton
            size="xs"
            href={`${routes.maspShield}?${params.asset}=${originalAddress}`}
          >
            Shield
          </ActionButton>
          {isNamadaAsset(asset) && (
            <ActionButton
              size="xs"
              className="w-fit mx-auto"
              backgroundColor="cyan"
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
        id="transparent-tokens"
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

const PanelContent = ({ data }: { data: TokenBalance[] }): JSX.Element => {
  const namBalance = data.find((i) => isNamadaAsset(i.asset));

  return (
    <div className="flex flex-col gap-2">
      <div className="grid md:grid-cols-2 gap-2">
        {[
          {
            title: "Total Transparent Asset Balance",
            amount: getTotalDollar(data),
            button: (
              <ActionButton size="xs" href={routes.maspShield}>
                Shield
              </ActionButton>
            ),
          },
          {
            title: "Transparent NAM Balance",
            amount: namBalance?.dollar,
            namAmount: namBalance?.amount,
            button: (
              <ActionButton
                size="xs"
                backgroundColor="cyan"
                href={routes.stakingBondingIncrement}
              >
                Stake
              </ActionButton>
            ),
          },
        ].map(({ title, amount, namAmount, button }) => (
          <div key={title} className="bg-gray px-6 py-3 rounded-sm flex gap-6">
            <div className="flex-1 overflow-auto">
              <div className="text-sm">{title}</div>
              <div className="text-2xl sm:text-3xl whitespace-nowrap overflow-auto">
                {amount ?
                  <FiatCurrency amount={amount} />
                : "N/A"}
              </div>
              {namAmount && namBalance && (
                <TokenCurrency
                  amount={namAmount}
                  symbol={namBalance.asset.symbol}
                  className="text-neutral-400 text-sm"
                />
              )}
            </div>
            <div className="self-center">{button}</div>
          </div>
        ))}
      </div>
      <TransparentTokensTable data={data} />
    </div>
  );
};

export const TransparentOverviewPanel = (): JSX.Element => {
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);

  return (
    <Panel className="min-h-[300px] flex flex-col" title="Transparent Overview">
      {transparentTokensQuery.isPending ?
        <SkeletonLoading height="100%" width="100%" />
      : <AtomErrorBoundary
          result={transparentTokensQuery}
          niceError="Unable to load your transparent balance"
          containerProps={{ className: "pb-16" }}
        >
          {transparentTokensQuery.data?.length ?
            <PanelContent data={transparentTokensQuery.data} />
          : <div className="bg-neutral-900 p-6 rounded-sm text-center font-medium my-14">
              You currently hold no assets in your unshielded account
            </div>
          }
        </AtomErrorBoundary>
      }
    </Panel>
  );
};
