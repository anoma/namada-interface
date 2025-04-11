import { TabContainer } from "@namada/components";
import { MaspShield } from "App/Masp/MaspShield";
import { MaspUnshield } from "App/Masp/MaspUnshield";
import { NamadaTransfer } from "App/NamadaTransfer/NamadaTransfer";
import { routes } from "App/routes";
import { ReceiveCard } from "App/Transfer/ReceiveCard";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type MoveAssetsTab = "shield" | "unshield" | "send" | "receive";

enum MoveAssetsTabEnum {
  SHIELD = 0,
  UNSHIELD = 1,
  SEND = 2,
  RECEIVE = 3,
}

export const MoveAssets = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = (): MoveAssetsTab => {
    const path = location.pathname;
    if (path.includes(routes.maspShield)) return "shield";
    if (path.includes(routes.maspUnshield)) return "unshield";
    if (path.includes(routes.transfer)) return "send";
    if (path.includes(routes.receive)) return "receive";
    return "shield";
  };

  const getInitialTabIndex = (): number => {
    const currentTab = getInitialTab();
    switch (currentTab) {
      case "shield":
        return MoveAssetsTabEnum.SHIELD;
      case "unshield":
        return MoveAssetsTabEnum.UNSHIELD;
      case "send":
        return MoveAssetsTabEnum.SEND;
      case "receive":
        return MoveAssetsTabEnum.RECEIVE;
      default:
        return 0;
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialTabIndex());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getInitialTabIndex());
  }, [location.pathname]);

  const handleTabChange = (index: number): void => {
    setActiveTab(index);

    switch (index) {
      case MoveAssetsTabEnum.SHIELD:
        navigate(routes.maspShield);
        break;
      case MoveAssetsTabEnum.UNSHIELD:
        navigate(routes.maspUnshield);
        break;
      case MoveAssetsTabEnum.SEND:
        navigate(routes.transfer);
        break;
      case MoveAssetsTabEnum.RECEIVE:
        navigate(routes.receive);
        break;
      default:
        navigate(routes.maspShield);
    }
  };

  return (
    <TabContainer
      id="move-assets"
      title="Move Assets"
      activeTabIndex={activeTab}
      onChangeActiveTab={handleTabChange}
      containerClassname="bg-black h-[calc(100vh-179px)] rounded-sm"
      tabs={[
        {
          title: "Shield",
          children: <MaspShield />,
        },
        {
          title: "Unshield",
          children: <MaspUnshield />,
        },
        {
          title: "Send",
          children: <NamadaTransfer />,
        },
        {
          title: "Receive",
          children: <ReceiveCard />,
        },
      ]}
    />
  );
};
