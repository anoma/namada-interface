import { ActionButton, SkeletonLoading, TableRow } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { TokenCard } from "App/Common/TokenCard";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { UnshieldAssetsModal } from "App/Common/UnshieldAssetsModal";
import { TokenBalance } from "atoms/balance/atoms";
import { applicationFeaturesAtom } from "atoms/settings/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { namadaAsset } from "utils";

const resultsPerPage = 100;
const initialPage = 0;

export const ShieldedFungibleTable = ({
  data,
  rewards,
}: {
  data: TokenBalance[];
  rewards: Record<string, BigNumber> | undefined;
}): JSX.Element => {
  const [page, setPage] = useState(initialPage);
  const [unshieldingModalOpen, setUnshieldingModalOpen] = useState(false);
  const [assetAddress, setAssetAddress] = useState("");

  const { shieldingRewardsEnabled } = useAtomValue(applicationFeaturesAtom);

  const headers = ["Token", { children: "Balance", className: "text-right" }];
  if (shieldingRewardsEnabled) {
    headers.push({
      children: "Rewards est next 24hrs",
      className: "text-right",
    });
  }

  const renderRow = ({
    originalAddress,
    asset,
    amount,
    dollar,
  }: TokenBalance): TableRow => {
    const reward = rewards?.[originalAddress];

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
          {amount.toString()}
          {dollar && (
            <FiatCurrency
              className="text-neutral-600 text-sm"
              amount={dollar}
            />
          )}
        </div>,
        <div
          key={`ssr-rate-${originalAddress}`}
          className="text-right leading-tight "
        >
          {shieldingRewardsEnabled &&
            (reward ?
              <TokenCurrency
                symbol={namadaAsset().symbol}
                amount={reward}
                className="text-yellow"
              />
            : <SkeletonLoading
                width="120px"
                height="20px"
                className="float-right"
              />)}
        </div>,
        <ActionButton
          key={`unshield-${originalAddress}`}
          size="xs"
          outlineColor="white"
          className="w-fit mx-auto"
          onClick={() => {
            setUnshieldingModalOpen(true);
            setAssetAddress(originalAddress);
          }}
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
      {unshieldingModalOpen && (
        <UnshieldAssetsModal
          assetAddress={assetAddress}
          onClose={() => setUnshieldingModalOpen(false)}
        />
      )}
    </>
  );
};
