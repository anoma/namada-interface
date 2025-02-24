import { ActionButton, Panel } from "@namada/components";
import image from "./assets/learn-about-governance.png";

export const LearnAboutGovernance = (): JSX.Element => {
  return (
    <Panel>
      <div className="max-w-[260px] mx-auto flex flex-col gap-4 py-2 text-center text-yellow leading-tight">
        <img src={image} className="w-full max-w-42 mx-auto" />
        <div>Learn more about Governance</div>
        <ActionButton
          href="https://docs.namada.net/users/namadillo/governance"
          target="_blank"
          rel="nofollow noreferrer"
          size="xs"
        >
          Learn about Governance
        </ActionButton>
      </div>
    </Panel>
  );
};
