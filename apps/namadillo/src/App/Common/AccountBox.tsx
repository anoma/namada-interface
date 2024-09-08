import { twMerge } from "tailwind-merge";
import { ActiveAccount } from "./ActiveAccount";
import { SwitchAccount } from "./SwitchAccount";

export const AccountBox = (): JSX.Element => {
  return (
    <div>
      <span
        className={twMerge(
          "px-4 py-2.5 flex items-center text-xs rounded-[2px]",
          "text-white bg-black rounded-xs"
        )}
      >
        <ActiveAccount />
        <SwitchAccount />
      </span>
    </div>
  );
};
