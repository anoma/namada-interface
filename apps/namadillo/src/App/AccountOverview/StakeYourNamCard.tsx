import { ActionButton } from "@namada/components";
import { routes } from "App/routes";
import clsx from "clsx";
import { useLocation, useNavigate } from "react-router-dom";

export const StakeYourNamCard = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-12 text-sm text-cyan bg-neutral-900 rounded-sm px-6",
        "py-6"
      )}
    >
      <span className="max-w-[15ch] text-center leading-tight">
        Stake your Transparent NAM
      </span>
      <ActionButton
        className="w-auto"
        size="xs"
        backgroundColor="cyan"
        textColor="black"
        onClick={() =>
          navigate(routes.stakingBondingIncrement, {
            state: { backgroundLocation: location },
          })
        }
      >
        Stake NAM
      </ActionButton>
    </div>
  );
};
