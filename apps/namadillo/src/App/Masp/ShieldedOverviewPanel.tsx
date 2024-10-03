import { ActionButton, Panel } from "@namada/components";
import { routes } from "App/routes";
import { useIsAuthenticated } from "hooks/useIsAuthenticated";
import { useState } from "react";
import { ShieldedFungibleTable } from "./ShieldedFungibleTable";
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

  // TODO
  const isEmpty = true;

  if (isEmpty) {
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
    <>
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
      {tab === "Fungible" && <ShieldedFungibleTable />}
      {tab === "NFT" && <ShieldedNFTTable />}
    </>
  );
};

export const ShieldedOverviewPanel: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Panel
      className="relative pb-6 border border-yellow min-h-[500px] flex flex-col"
      title={isAuthenticated ? "Shielded Overview" : undefined}
    >
      {isAuthenticated ?
        <AssetTable />
      : <ShieldAssetCta />}
    </Panel>
  );
};
