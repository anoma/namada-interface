import { ActionButton, Panel, Stack } from "@namada/components";
import { DISCORD_URL } from "config/links";
import { BsDiscord } from "react-icons/bs";

export const ProposalDiscord: React.FC = () => {
  return (
    <Panel className="text-center text-black bg-[#E9E9E9] p-8">
      <Stack gap={4}>
        <BsDiscord className="m-auto text-8xl" />
        <p className="text-xl">Join proposal discussions on discord</p>
        <ActionButton
          size="xs"
          borderRadius="sm"
          color="black"
          as="a"
          href={DISCORD_URL}
          target="_blank"
        >
          Discord
        </ActionButton>
      </Stack>
    </Panel>
  );
};
