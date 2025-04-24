import { ActionButton, Panel, Stack } from "@namada/components";
import { BsDiscord } from "react-icons/bs";
import { DISCORD_URL } from "urls";

export const JoinDiscord: React.FC = () => {
  return (
    <Panel className="text-center text-black bg-[#E9E9E9] px-8 pt-10 pb-14">
      <Stack gap={6}>
        <BsDiscord className="m-auto text-[90px] leading-none -mb-3" />
        <p className="text-[18px] leading-tight">
          Join the discussions on Discord
        </p>
        <ActionButton
          size="xs"
          backgroundColor="black"
          className="text-white"
          backgroundHoverColor="cyan"
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer"
        >
          Discord
        </ActionButton>
      </Stack>
    </Panel>
  );
};
