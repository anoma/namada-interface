import { Heading } from "@namada/components";
import clsx from "clsx";
import React from "react";
import { GoGear } from "react-icons/go";

const iconsClassList = clsx(
  "flex h-full absolute items-center text-black cursor-pointer text-[22px]",
  "top-0 transition-colors ease-out active:top-px hover:text-cyan"
);

export const AppHeader: React.FC = () => {
  return (
    <Heading className="uppercase text-black text-4xl" level="h1">
      Namada Faucet
      <i
        className={clsx(iconsClassList, "right-7")}
        onClick={() => console.log("SETTINGS")}
      >
        <GoGear />
      </i>
    </Heading>
  );
};
