import {
  Heading,
  HeadingLevel,
  NavigationContainer,
  Tab,
  TabsGroup,
} from "@namada/components";
import { BridgeContainer } from "./Bridge.components";
import IBCTransfer from "App/Token/IBCTransfer/IBCTransfer";
import { useState } from "react";
import { EthereumBridge } from "App/Token";

export const Bridge = (): JSX.Element => {
  const tabs = ["IBC", "Ethereum"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <BridgeContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Bridge</Heading>
      </NavigationContainer>

      <TabsGroup>
        {tabs.map((tab) => (
          <Tab
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </Tab>
        ))}
      </TabsGroup>
      {activeTab == tabs[0] ? <IBCTransfer /> : <EthereumBridge />}
    </BridgeContainer>
  );
};
