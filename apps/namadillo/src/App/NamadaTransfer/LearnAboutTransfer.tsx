import { ActionButton, Panel } from "@namada/components";
import image from "./assets/learn-about-transfer.png";

export const LearnAboutTransfer = (): JSX.Element => {
  return (
    <Panel>
      <div className="max-w-[260px] mx-auto flex flex-col gap-4 py-2 text-center text-yellow leading-tight">
        <img src={image} className="w-full max-w-42 mx-auto pr-11" />
        <div>
          Namada offers both shielded and transparent transfers. Giving you the
          options of selective disclosure
        </div>
        <ActionButton
          href="https://docs.namada.net/users/namadillo/transfer"
          target="_blank"
          rel="nofollow noreferrer"
          size="xs"
        >
          Learn about Transfers
        </ActionButton>
      </div>
    </Panel>
  );
};
