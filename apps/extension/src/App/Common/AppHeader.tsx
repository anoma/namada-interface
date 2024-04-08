import clsx from "clsx";
import { useState } from "react";
import { GoArrowLeft, GoGear, GoPersonFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { AppHeaderNavigation } from "./AppHeaderNavigation";

import routes from "../routes";

type AppHeaderProps = {
  returnButton?: boolean;
  settingsButton?: boolean;
  accountsButton?: boolean;
};

export const AppHeader = ({
  returnButton = false,
  settingsButton = false,
  accountsButton = false,
}: AppHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const iconsClassList = clsx(
    "flex h-full absolute items-center text-yellow cursor-pointer text-[22px]",
    "top-0 transition-colors ease-out active:top-px hover:text-cyan"
  );

  return (
    <>
      {returnButton && (
        <i
          className={clsx(iconsClassList, "left-7")}
          onClick={() => navigate(-1)}
        >
          <GoArrowLeft />
        </i>
      )}

      {accountsButton && (
        <span
          className={clsx(iconsClassList, "right-7")}
          onClick={() => navigate(routes.viewAccountList())}
        >
          <GoPersonFill />
        </span>
      )}

      {settingsButton && (
        <i
          className={clsx(iconsClassList, "left-7")}
          onClick={() => setOpen(true)}
        >
          <GoGear />
        </i>
      )}
      <AppHeaderNavigation onClose={() => setOpen(false)} open={open} />
    </>
  );
};
