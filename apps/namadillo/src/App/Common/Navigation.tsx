import { SidebarMenuItem } from "App/Common/SidebarMenuItem";
import GovernanceRoutes from "App/Governance/routes";
import { MASPIcon } from "App/Icons/MASPIcon";
import { SwapIcon } from "App/Icons/SwapIcon";
import { AiFillHome } from "react-icons/ai";
import { BsDiscord, BsTwitterX } from "react-icons/bs";
import { FaVoteYea } from "react-icons/fa";
import { GoStack } from "react-icons/go";
import { IoSwapHorizontal } from "react-icons/io5";
import { DISCORD_URL, TWITTER_URL } from "urls";

import StakingRoutes from "App/Staking/routes";

export const Navigation = (): JSX.Element => {
  return (
    <div className="h-full flex flex-col justify-between flex-1 pt-6 pb-8 px-6">
      <ul className="flex flex-col gap-4">
        <li>
          <SidebarMenuItem url={"/"}>
            <AiFillHome />
            Overview
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem url={StakingRoutes.index()}>
            <GoStack />
            Staking
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem url={GovernanceRoutes.index()}>
            <FaVoteYea />
            Governance
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem>
            <IoSwapHorizontal />
            Transfer
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem>
            <i className="w-4">
              <MASPIcon />
            </i>
            MASP
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem>
            <i className="w-4">
              <SwapIcon />
            </i>
            Swap
          </SidebarMenuItem>
        </li>
      </ul>
      <footer className="flex flex-col gap-10">
        <ul className="flex flex-col gap-1 text-neutral-300 text-sm">
          <li>
            <a
              href={DISCORD_URL}
              className="hover:text-cyan"
              target="_blank"
              rel="nofollow noreferrer"
            >
              Help
            </a>
          </li>
        </ul>
        <ul className="flex items-center gap-4 text-yellow text-2xl">
          <li>
            <a
              href={TWITTER_URL}
              className="transition-colors duration-300 hover:text-cyan"
            >
              <BsTwitterX />
            </a>
          </li>
          <li>
            <a
              href={DISCORD_URL}
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
