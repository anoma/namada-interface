import { Icon, Image } from "@namada/components";
import clsx from "clsx";
import { useVaultContext } from "context";
import { useState } from "react";
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
    "flex h-full absolute items-center text-yellow cursor-pointer",
    "top-0 transition-colors ease-out w-5 active:top-px hover:text-cyan"
  );

  return (
    <>
      <header>
        {returnButton && (
          <span
            className={clsx(iconsClassList, "left-7")}
            onClick={() => navigate(-1)}
          >
            <Icon size="full" fill name="ArrowLeft" />
          </span>
        )}

        {lockButton && (
          <span
            className={clsx(iconsClassList, "w-[18px] left-7")}
            onClick={() => lock()}
          >
            <Icon size="full" fill name="Lock" />
          </span>
        )}

        <div className="max-w-[168px] mx-auto">
          <Image imageName="Logo" />
        </div>

        {settingsButton && (
          <span
            className={clsx(iconsClassList, "right-7")}
            onClick={() => setOpen(true)}
          >
            <Icon size="full" fill name="Settings" />
          </span>
        )}
        <AppHeaderNavigation onClose={() => setOpen(false)} open={open} />
      </header>
    </>
  );
};
