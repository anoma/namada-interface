import { ActionButton } from "@namada/components";
import clsx from "clsx";
import stakingInfo from "./assets/staking-info.png";

// TODO: Define correct URL
export const ValidatorDiversification = (): JSX.Element => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center text-[18px] py-8 px-2 text-center text-yellow",
        "gap-7 leading-tight"
      )}
    >
      <img src={stakingInfo} className="max-w-42 mx-auto" />
      <p>When staking consider diversifying Across multiple validators.</p>
      <ActionButton
        className="max-w-44"
        href="https://namada.net"
        borderRadius="sm"
        size="xs"
      >
        Learn about CPos
      </ActionButton>
    </div>
  );
};
