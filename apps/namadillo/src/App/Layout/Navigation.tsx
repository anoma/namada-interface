import { SidebarMenuItem } from "App/Common/SidebarMenuItem";
import GovernanceRoutes from "App/Governance/routes";
import { MASPIcon } from "App/Icons/MASPIcon";
import { useAtomValue } from "jotai";
import { AiFillHome } from "react-icons/ai";
import { BsDiscord, BsTwitterX } from "react-icons/bs";
import { FaVoteYea } from "react-icons/fa";
import { GoStack } from "react-icons/go";
import { IoSwapHorizontal } from "react-icons/io5";
import { TbVectorTriangle } from "react-icons/tb";
import { DISCORD_URL, TWITTER_URL } from "urls";

import IbcRoutes from "App/Ibc/routes";
import StakingRoutes from "App/Staking/routes";
import TransferRoutes from "App/Transfer/routes";
import { applicationFeaturesAtom } from "atoms/settings";

export const Navigation = (): JSX.Element => {
  const features = useAtomValue(applicationFeaturesAtom);

  const menuItems: { label: string; icon: React.ReactNode; url?: string }[] = [
    {
      label: "Overview",
      icon: <AiFillHome />,
      url: "/",
    },
    {
      label: "Staking",
      icon: <GoStack />,
      url: StakingRoutes.index(),
    },
    {
      label: "Governance",
      icon: <FaVoteYea />,
      url: GovernanceRoutes.index(),
    },
    {
      label: "MASP",
      icon: <MASPIcon />,
      url: features.maspEnabled ? TransferRoutes.masp().url : undefined,
    },
    {
      label: "IBC Transfer",
      icon: <TbVectorTriangle />,
      url: features.ibcTransfersEnabled ? IbcRoutes.index() : undefined,
    },
    {
      label: "Transfer",
      icon: <IoSwapHorizontal />,
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between flex-1 pt-6 pb-8 px-6">
      <ul className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <li key={item.label}>
            <SidebarMenuItem url={item.url}>
              {item.icon}
              {item.label}
            </SidebarMenuItem>
          </li>
        ))}
      </ul>
      <footer className="flex flex-col gap-10">
        <ul className="flex flex-col gap-1 text-neutral-300 text-sm">
          <li>
            <a
              href={DISCORD_URL}
              className="hover:text-cyan"
              target="_blank"
              rel="noreferrer"
            >
              Community Help
            </a>
          </li>
        </ul>
        <ul className="flex items-center gap-4 text-yellow text-2xl">
          <li>
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 hover:text-cyan"
            >
              <BsTwitterX />
            </a>
          </li>
          <li>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 hover:text-cyan"
            >
              <BsDiscord />
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
};
