import { ExternalPageIcon } from "App/Icons/ExternalPageIcon";
import {
  ExtensionSecurityInfo,
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
        <InstallExtensionPanel>
          Install the Namada Browser extension or use the Namada CLI to create
          your NAM keys to submit for the genesis block proposal
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
            <ExtensionSecurityInfo>
              <WarningIcon />
              <ul>
                <li>Make sure you back up your seed phrase in a safe place</li>
                <li>
                  No one from Heliax, Anoma Foundation, or anyone else will be
                  able to recover your seed phrase if you lose it.
                </li>
                <li>
                  We will never ask you for your private key or seed phrase.
                </li>
              </ul>
            </ExtensionSecurityInfo>
          </Stack>
        )}
      </MainContainer>
    </SidebarPageGrid>
  );
};
