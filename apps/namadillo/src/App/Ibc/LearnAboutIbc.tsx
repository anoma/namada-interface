import { ActionButton, Panel } from "@namada/components";
import image from "./assets/learn-about-ibc.svg";

export const LearnAboutIbc = (): JSX.Element => {
  return (
    <Panel>
      <div className="max-w-[260px] mx-auto flex flex-col gap-4 py-2 text-center text-white leading-tight">
        <img src={image} className="w-full max-w-42 mx-auto" />
        <div>Learn more about IBC transfer with Namada</div>
        <ActionButton
          href="https://docs.namada.net/users/namadillo/ibc"
          target="_blank"
          rel="nofollow noreferrer"
          size="xs"
          backgroundColor="white"
        >
          Learn about IBC
        </ActionButton>
      </div>
    </Panel>
  );
};
