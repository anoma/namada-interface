import { ActionButton, Panel, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { routes } from "App/routes";
import {
  assetsByDenomAtom,
  fiatPriceMapAtom,
  shieldedBalanceAtom,
} from "atoms/masp/atoms";
import BigNumber from "bignumber.js";
import { useUserHasAccount } from "hooks/useIsAuthenticated";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { unknownAsset } from "registry/unknownAsset";
import { ShieldedFungibleTable, TokenRow } from "./ShieldedFungibleTable";
import { ShieldedNFTTable } from "./ShieldedNFTTable";

const tabs = ["Fungible", "NFT"];

const ShieldAssetCta = (): JSX.Element => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ActionButton href={routes.ibc} className="w-fit uppercase">
        Shield your first assets
      </ActionButton>
    </div>
  );
};

const AssetTable = (): JSX.Element => {
  const [tab, setTab] = useState(tabs[0]);
  const shieldedBalanceQuery = useAtomValue(shieldedBalanceAtom);
  const assetsByDenom = useAtomValue(assetsByDenomAtom);
  const fiatPriceMap = useAtomValue(fiatPriceMapAtom);

  const data: TokenRow[] | undefined = useMemo(() => {
    return shieldedBalanceQuery.data?.map(({ denom, amount }) => {
      const asset = assetsByDenom[denom] ?? unknownAsset;
      const fiatValue = fiatPriceMap.data?.[denom];
      return {
        asset,
        balance: new BigNumber(amount),
        dollar:
          fiatValue ? new BigNumber(amount).multipliedBy(fiatValue) : undefined,
        ssrRate: undefined, // TODO
      };
    });
  }, [shieldedBalanceQuery.data, fiatPriceMap.data]);

  if (data === undefined) {
    return <SkeletonLoading height="100%" width="100%" />;
  }

  if (!data.length) {
    return (
      <>
        <div className="bg-gray p-6 rounded-sm text-center font-medium">
          You currently have no shielded assets
        </div>
        <ShieldAssetCta />
      </>
    );
  }

  return (
    <AtomErrorBoundary
      result={shieldedBalanceQuery}
      niceError="Unable to load your shielded balance"
      containerProps={{ className: "pb-16" }}
    >
      <div className="flex">
        {tabs.map((name) => {
          const selected = name == tab;
          return (
            <ActionButton
              key={name}
              backgroundColor={selected ? "black" : "gray"}
              outlineColor={selected ? "yellow" : undefined}
              textColor={selected ? "yellow" : "white"}
              backgroundHoverColor="yellow"
              onClick={() => setTab(name)}
            >
              {name}
            </ActionButton>
          );
        })}
      </div>
      {tab === "Fungible" && <ShieldedFungibleTable data={data} />}
      {tab === "NFT" && <ShieldedNFTTable />}
    </AtomErrorBoundary>
  );
};

export const ShieldedOverviewPanel: React.FC = () => {
  const userHasAccount = useUserHasAccount();

  return (
    <Panel
      className="relative pb-6 border border-yellow min-h-[500px] flex flex-col"
      title={userHasAccount ? "Shielded Overview" : undefined}
    >
      {userHasAccount ?
        <AssetTable />
      : <ShieldAssetCta />}
    </Panel>
  );
};
