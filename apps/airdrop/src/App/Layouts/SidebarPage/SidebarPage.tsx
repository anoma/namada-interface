import { ExternalPageIcon } from "App/Icons/ExternalPageIcon";
import {
  ExtensionSecurityWarning,
  IconWrap,
  MainContainer,
  MainContent,
  SidebarPageGrid,
  SidebarTitle,
  SocialList,
  SocialListItem,
  TermsLinkWrapper,
  TermsLinkWrapperWithIcon,
} from "./SidebarPage.components";
import { DiscordIcon } from "App/Icons/DiscordIcon";
import { TwitterXIcon } from "App/Icons/TwitterXIcon";
import { GlobeIcon } from "App/Icons/GlobeIcon";
import { InstallExtensionPanel } from "App/Common/InstallExtensionPanel";
import { Stack } from "@namada/components";
import { WarningIcon } from "App/Icons/WarningIcon";
import { WarningList } from "App/Common/Warning";

type SidebarPageProps = {
  children: React.ReactNode;
  displayInstructions?: boolean;
};

export const SidebarPage = ({
  children,
  displayInstructions,
}: SidebarPageProps): JSX.Element => {
  return (
    <SidebarPageGrid>
      <aside>
        <SidebarTitle>
          <TermsLinkWrapper href="/terms-and-conditions" target="_blank">
            Terms and Conditions{" "}
            <IconWrap>
              <ExternalPageIcon />
            </IconWrap>
          </TermsLinkWrapper>
        </SidebarTitle>
        <SocialList>
          <SocialListItem>
            <TermsLinkWrapper
              href="https://namada.net/blog/the-namada-rpgf-drop-is-live/"
              target="_blank"
              rel="nofollow noreferrer"
            >
              Announcement{" "}
              <IconWrap>
                <ExternalPageIcon />
              </IconWrap>
            </TermsLinkWrapper>
          </SocialListItem>

          <SocialListItem>
            <TermsLinkWrapperWithIcon
              href="https://discord.com/invite/namada"
              target="_blank"
              rel="nofollow noreferrer"
            >
              <DiscordIcon />
              Join Discord{" "}
              <IconWrap>
                <ExternalPageIcon />
              </IconWrap>
            </TermsLinkWrapperWithIcon>
          </SocialListItem>

          <SocialListItem>
            <TermsLinkWrapperWithIcon
              href="https://twitter.com/namada"
              target="_blank"
              rel="nofollow noreferrer"
            >
              <TwitterXIcon />
              Follow Namada on X{" "}
              <IconWrap>
                <ExternalPageIcon />
              </IconWrap>
            </TermsLinkWrapperWithIcon>
          </SocialListItem>

          <SocialListItem>
            <TermsLinkWrapperWithIcon
              href="https://namada.net"
              target="_blank"
              rel="nofollow noreferrer"
            >
              <TermsLinkWrapperWithIcon>
                <GlobeIcon />
                Go to website{" "}
                <IconWrap>
                  <ExternalPageIcon />
                </IconWrap>
              </TermsLinkWrapperWithIcon>
            </TermsLinkWrapperWithIcon>
          </SocialListItem>
        </SocialList>
        <InstallExtensionPanel>
          Install the Namada Browser extension to create your Namada genesis
          accounts.
        </InstallExtensionPanel>
      </aside>
      <MainContainer>
        <MainContent>{children}</MainContent>
        {displayInstructions && (
          <Stack gap={5}>
            <InstallExtensionPanel size="large">
              Install the Namada Browser extension or use the Namada CLI to
              create your NAM keys and add the public key to Namada genesis
              block proposal using “Claim NAM” button above
            </InstallExtensionPanel>
            <ExtensionSecurityWarning
              icon={<WarningIcon />}
              iconWidth={"60px"}
              orientation={"horizontal"}
            >
              <WarningList />
            </ExtensionSecurityWarning>
          </Stack>
        )}
      </MainContainer>
    </SidebarPageGrid>
  );
};
