import clsx from "clsx";
import { useVaultContext } from "context";
import { useState } from "react";
import { GoArrowLeft, GoGear, GoUnlock } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { AppHeaderNavigation } from "./AppHeaderNavigation";

type AppHeaderProps = {
  returnButton: boolean;
  settingsButton: boolean;
  lockButton: boolean;
};

export const AppHeader = ({
  returnButton,
  settingsButton,
  lockButton,
}: AppHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { lock } = useVaultContext();

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

      {lockButton && (
        <span className={clsx(iconsClassList, "left-7")} onClick={() => lock()}>
          <GoUnlock />
        </span>
      )}

      {settingsButton && (
        <i
          className={clsx(iconsClassList, "right-7")}
          onClick={() => setOpen(true)}
        >
          <GoGear />
        </i>
      )}
      <AppHeaderNavigation onClose={() => setOpen(false)} open={open} />
    </>
  );
};
