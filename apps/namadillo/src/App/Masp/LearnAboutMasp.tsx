import { ActionButton, Panel } from "@namada/components";
import image from "./assets/learn-about-masp.png";

export const LearnAboutMasp = (): JSX.Element => {
  return (
    <Panel>
      <div className="max-w-[260px] mx-auto flex flex-col gap-4 py-2 text-center text-yellow leading-tight">
        <div className="uppercase">Shielding Rewards</div>
        <img src={image} className="w-full max-w-42 mx-auto" />
        <div>
          Shield your assets to earn shielded set rewards. Rewards are added to
          your NAM balance automatically. The more assets you shield the more
          you will earn.
        </div>
        <ActionButton
          href="https://docs.namada.net/users/namadillo/masp"
          target="_blank"
          rel="nofollow noreferrer"
          size="xs"
        >
          Learn about MASP
        </ActionButton>
      </div>
    </Panel>
  );
};
