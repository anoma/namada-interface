import { ActionButton, SkeletonLoading, TableRow } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { TokenCard } from "App/Common/TokenCard";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { params, routes } from "App/routes";
import { TokenBalance, transparentTokensAtom } from "atoms/balance/atoms";
import { applicationFeaturesAtom } from "atoms/settings";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { IoSwapHorizontal } from "react-icons/io5";
import { TbVectorTriangle } from "react-icons/tb";
import { Link } from "react-router-dom";
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
  const { namTransfersEnabled } = useAtomValue(applicationFeaturesAtom);

  const headers = ["Token", { children: "Balance", className: "text-right" }];

  const renderRow = ({
    originalAddress,
    asset,
    amount,
    dollar,
  }: TokenBalance): TableRow => {
    const isNam = isNamadaAsset(asset);
    const namTransferLocked = isNam && !namTransfersEnabled;
    return {
      cells: [
        <TokenCard
          key={`token-${originalAddress}`}
          address={originalAddress}
          asset={asset}
        />,
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
          {(!isNam || namTransfersEnabled) && (
            <ActionButton
              size="xs"
              href={`${routes.maspShield}?${params.asset}=${originalAddress}`}
            >
              Shield
            </ActionButton>
          )}
          {isNam && (
            <ActionButton
              size="xs"
              className={`w-fit mx-auto ${namTransferLocked ? "-mr-2" : ""}`}
              backgroundColor="cyan"
              href={routes.stakingBondingIncrement}
            >
              Stake
            </ActionButton>
          )}
          <div className="flex items-center gap-8 ml-8 text-neutral-450">
            {namTransferLocked ?
              <span className="text-xs">NAM Transfer Locked</span>
            : [
                {
                  url: `${routes.transfer}?${params.asset}=${originalAddress}&${params.shielded}=0`,
                  icon: <IoSwapHorizontal className="h-[20px] w-[20px]" />,
                },
                {
                  url: `${routes.ibcWithdraw}?${params.asset}=${originalAddress}`,
                  icon: (
                    <TbVectorTriangle className="h-[20px] w-[20px] -mt-1" />
                  ),
                },
              ].map(({ url, icon }) => (
                <Link
                  key={url}
                  to={url}
                  className={twMerge(
                    "bg-black rounded-full w-10 h-10 flex items-center justify-center p-0",
                    "hover:bg-white hover:text-black transition-all duration-300"
                  )}
                >
                  {icon}
                </Link>
              ))
            }
          </div>
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
      <div className="text-sm font-medium mt-6 ml-4">
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

export const UnshieldedAssetTable = (): JSX.Element => {
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);

  const nonZeroTransparentTokens = useMemo(() => {
    if (!transparentTokensQuery.data) return [];
    return transparentTokensQuery.data.filter((i) => i.amount.gt(0));
  }, [transparentTokensQuery.data]);

  return (
    <>
      {transparentTokensQuery.isPending ?
        <SkeletonLoading height="100%" width="100%" />
      : <AtomErrorBoundary
          result={transparentTokensQuery}
          niceError="Unable to load your transparent balance"
          containerProps={{ className: "pb-16" }}
        >
          {nonZeroTransparentTokens.length ?
            <TransparentTokensTable data={nonZeroTransparentTokens} />
          : <div className="bg-neutral-900 p-6 rounded-sm text-center font-medium my-14">
              You currently hold no assets in your unshielded account
            </div>
          }
        </AtomErrorBoundary>
      }
    </>
  );
};
