import { Icon, IconName, Stack } from "@namada/components";
import {
  CloseNavigationIcon,
  Footer,
  IconContainer,
  NavigationContainer,
  NavigationItem,
  NavigationPanel,
  NavigationPanelOverlay,
} from "./AppHeaderNavigation.components";
import { useNavigate } from "react-router-dom";
import routes from "App/routes";
import { useVaultContext } from "context";

type AppHeaderNavigationProps = {
  open: boolean;
  onClose: () => void;
};

export const AppHeaderNavigation = ({
  open,
  onClose,
}: AppHeaderNavigationProps): JSX.Element => {
  const { lock } = useVaultContext();
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClose();
  };

  const goTo = (callback: () => string): void => {
    navigate(callback());
    onClose();
  };

  const onLock = (): void => {
    lock();
    onClose();
  };

  return (
    <>
      <NavigationPanel open={open}>
        <CloseNavigationIcon onClick={onClick}>&#x2715;</CloseNavigationIcon>
        <NavigationContainer>
          <Stack gap={4} as="ul">
            <NavigationItem onClick={() => goTo(routes.changePassword)}>
              Change Password
            </NavigationItem>
            <NavigationItem onClick={() => goTo(routes.connectedSites)}>
              Connected Sites
            </NavigationItem>
            <NavigationItem onClick={onLock}>Lock Wallet</NavigationItem>
          </Stack>
          <Footer>
            <Stack as="ul" gap={4} direction="horizontal">
              <IconContainer
                href="https://discord.com/invite/namada"
                target="_blank"
                rel="noreferrer nofollow"
              >
                <Icon
                  fillColorOverride="currentColor"
                  iconName={IconName.Discord}
                />
              </IconContainer>
              <IconContainer
                href="https://twitter.com/namada"
                target="_blank"
                rel="noreferrer nofollow"
              >
                <Icon
                  fillColorOverride="currentColor"
                  iconName={IconName.TwitterX}
                />
              </IconContainer>
            </Stack>
            <IconContainer
              href="https://discord.com/channels/833618405537218590/1074984397599678534"
              target="_blank"
              rel="noreferrer nofollow"
            >
              <Icon
                fillColorOverride="currentColor"
                iconName={IconName.QuestionMark}
              />
            </IconContainer>
          </Footer>
        </NavigationContainer>
      </NavigationPanel>
      {open && <NavigationPanelOverlay onClick={onClick} />}
    </>
  );
};
