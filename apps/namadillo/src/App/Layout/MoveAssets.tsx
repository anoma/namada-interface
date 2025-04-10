import { TabContainer } from "@namada/components";
import { MaspShield } from "App/Masp/MaspShield";
import { MaspUnshield } from "App/Masp/MaspUnshield";
import { NamadaTransfer } from "App/NamadaTransfer/NamadaTransfer";
import { ReceiveCard } from "App/Transfer/RecieveCard";
import { useState } from "react";

export const MoveAssets = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabContainer
      id="move-assets"
      title="Move Assets"
      activeTabIndex={activeTab}
      onChangeActiveTab={(index: number) => setActiveTab(index)}
      tabs={[
        {
          title: "Shield",
          children: <MaspShield />,
        },
        { title: "Unshield", children: <MaspUnshield /> },
        { title: "Send", children: <NamadaTransfer /> },
        { title: "Recieve", children: <ReceiveCard /> },
      ]}
    ></TabContainer>
  );
};
