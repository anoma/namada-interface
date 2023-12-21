import { Heading, NavigationContainer } from "@namada/components";
import IBCTransfer from "App/Token/IBCTransfer/IBCTransfer";
import { BridgeContainer } from "./Bridge.components";
// import { useState } from "react";
// import { EthereumBridge } from "App/Token";

export const Bridge = (): JSX.Element => {
  // TODO: Re-enable Bridge form once Bridge features are available!
  // const tabs = ["IBC", "Ethereum"];
  // const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <BridgeContainer>
      <NavigationContainer>
        {/* <Heading level="h1">Bridge</Heading> */}
        <Heading level="h1">IBC Transfer</Heading>
      </NavigationContainer>

      {/* <TabsGroup> */}
      {/*   {tabs.map((tab) => ( */}
      {/*     <Tab */}
      {/*       className={tab === activeTab ? "active" : ""} */}
      {/*       onClick={() => setActiveTab(tab)} */}
      {/*       key={tab} */}
      {/*     > */}
      {/*       {tab} */}
      {/*     </Tab> */}
      {/*   ))} */}
      {/* </TabsGroup> */}
      {/* {activeTab == tabs[0] ? <IBCTransfer /> : <EthereumBridge />} */}
      <IBCTransfer />
    </BridgeContainer>
  );
};
