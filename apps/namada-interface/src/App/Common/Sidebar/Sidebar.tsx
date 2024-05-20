import { TopLevelRoute } from "App/types";
import { AiFillHome } from "react-icons/ai";
import { BsDiscord, BsTwitterX } from "react-icons/bs";
import { FaVoteYea } from "react-icons/fa";
import { GoStack } from "react-icons/go";
import { IoSwapHorizontal } from "react-icons/io5";
import { SidebarMenuItem } from "../SidebarMenuItem/SidebarMenuItem";

type Props = {
  a?: boolean;
};

export const Sidebar = (props: Props): JSX.Element => {
  return (
    <div className="h-full flex flex-col justify-between flex-1 pt-6 pb-8 px-6">
      <ul className="flex flex-col gap-4">
        <li>
          <SidebarMenuItem url={TopLevelRoute.Wallet}>
            <AiFillHome />
            Overview
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem url={TopLevelRoute.StakingAndGovernance}>
            <GoStack />
            Staking
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem url={TopLevelRoute.Proposals}>
            <FaVoteYea />
            Governance
          </SidebarMenuItem>
        </li>
        <li>
          <SidebarMenuItem url={TopLevelRoute.Bridge}>
            <IoSwapHorizontal />
            IBC Bridge
          </SidebarMenuItem>
        </li>
      </ul>
      <footer className="flex flex-col gap-10">
        <ul className="flex flex-col gap-1 text-neutral-300 text-sm">
          <li>
            <a href="#" className="hover:text-cyan">
              Help
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-cyan">
              Privacy Policy
            </a>
          </li>
        </ul>
        <ul className="flex items-center gap-4 text-yellow text-2xl transition-colors duration-300 ease-out-quad">
          <li>
            <a href="https://twitter.com/namada" className="hover:text-cyan">
              <BsTwitterX />
            </a>
          </li>
          <li>
            <a href="https://twitter.com/namada" className="hover:text-cyan">
              <BsDiscord />
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
};
