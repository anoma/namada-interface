import { ExternalPageIcon } from "App/Icons/ExternalPageIcon";
import {
  IconWrap,
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

type SidebarPageProps = {
  children: React.ReactNode;
};

export const SidebarPage = ({ children }: SidebarPageProps): JSX.Element => {
  return (
    <SidebarPageGrid>
      <aside>
        <SidebarTitle>
          <TermsLinkWrapper href="#">
            Terms of Service{" "}
            <IconWrap>
              <ExternalPageIcon />
            </IconWrap>
          </TermsLinkWrapper>
        </SidebarTitle>
        <SocialList>
          <SocialListItem>
            <TermsLinkWrapper href="#">
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
        <InstallExtensionPanel />
      </aside>
      <MainContent>{children}</MainContent>
    </SidebarPageGrid>
  );
};
