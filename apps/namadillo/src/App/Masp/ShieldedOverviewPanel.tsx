import { ActionButton } from "@namada/components";
import { useState } from "react";
import { ShieldedFungibleTable } from "./ShieldedFungibleTable";
import { ShieldedNFTTable } from "./ShieldedNFTTable";

const tabs = ["Fungible", "NFT"];

export const ShieldedOverviewPanel = (): JSX.Element => {
  const [tab, setTab] = useState(tabs[0]);

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
