import { Icon, IconName, Image, ImageName } from "@namada/components";
import { useVaultContext } from "context";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeaderNavigation } from "../AppHeaderNavigation";
import {
  HeaderContainer,
  LockContainer,
  LogoContainer,
  ReturnIcon,
  SettingsButton,
} from "./AppHeader.components";

type AppHeaderProps = {
  returnButton: boolean;
  settingsButton: boolean;
  lockButton: boolean;
};

export const AppHeader = ({
  returnButton,
  settingsButton,
  lockButton,
}: AppHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { lock } = useVaultContext();

  return (
    <>
      <HeaderContainer>
        {returnButton && (
          <ReturnIcon onClick={() => navigate(-1)}>
            <Icon
              strokeColorOverride="currentColor"
              fillColorOverride="currentColor"
              iconName={IconName.ArrowLeft}
            />
          </ReturnIcon>
        )}

        {lockButton && (
          <LockContainer onClick={() => lock()}>
            <Icon
              strokeColorOverride="currentColor"
              fillColorOverride="currentColor"
              iconName={IconName.Lock}
            />
          </LockContainer>
        )}

        <LogoContainer>
          <Image imageName={ImageName.Logo} />
        </LogoContainer>

        {settingsButton && (
          <SettingsButton onClick={() => setOpen(true)}>
            <Icon
              fillColorOverride="currentColor"
              strokeColorOverride="currentColor"
              iconName={IconName.Settings}
            />
          </SettingsButton>
        )}
        <AppHeaderNavigation onClose={() => setOpen(false)} open={open} />
      </HeaderContainer>
    </>
  );
};
