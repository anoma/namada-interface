import { ActionButton } from "@namada/components";
import clsx from "clsx";
import stakingInfo from "./assets/staking-info.png";

// TODO: Define correct URL
export const ValidatorDiversification = (): JSX.Element => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center text-[18px] py-8 px-2 text-center text-cyan",
        "gap-7 leading-tight"
      )}
    >
      <img src={stakingInfo} className="w-full max-w-42 mx-auto" />
      <p>When staking, consider diversifying across multiple validators</p>
      <ActionButton
        className="max-w-44"
        outlineColor="cyan"
        textHoverColor="black"
        backgroundHoverColor="cyan"
        href="https://namada.net/blog/namada-cubic-proof-of-stake"
        target="_blank"
        rel="nofollow noreferrer"
        size="xs"
      >
        Learn about CPoS
      </ActionButton>
    </div>
  );
};
