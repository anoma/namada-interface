import { OutlinedBox } from "../OutlinedBox";
import { DiscordIcon } from "App/Icons/DiscordIcon";
import { TwitterXIcon } from "App/Icons/TwitterXIcon";
import { CommunityFooterWrapper } from "./CommunityFooter.components";

export const CommunityFooter = (): JSX.Element => {
  return (
    <CommunityFooterWrapper>
      <OutlinedBox
        buttonText="Discord"
        icon={<DiscordIcon />}
        buttonUrl="https://discord.com/invite/namada"
        rightLineHidden={true}
      >
        Participate in the coordination of the Namada Network by joining the
        Namada Discord
      </OutlinedBox>

      <OutlinedBox
        buttonText="X.com"
        icon={<TwitterXIcon />}
        buttonUrl="https://twitter.com/namada"
        rightLineHidden={true}
      >
        Get the latest news and updates by following Namada on X
      </OutlinedBox>

      <OutlinedBox buttonText="namada.net" buttonUrl="https://namada.net">
        Back to namada.net
      </OutlinedBox>
    </CommunityFooterWrapper>
  );
};
