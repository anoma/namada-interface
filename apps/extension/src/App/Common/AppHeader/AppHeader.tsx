import { Icon, IconName, Image, ImageName } from "@namada/components";
import { useNavigate } from "react-router-dom";
import { AppHeaderNavigation } from "../AppHeaderNavigation";
import {
  HeaderContainer,
  LogoContainer,
  ReturnIcon,
  SettingsButton,
} from "./AppHeader.components";
import { useState } from "react";

type AppHeaderProps = {
  returnButton: boolean;
  settingsButton: boolean;
};

export const AppHeader = ({
  returnButton,
  settingsButton,
}: AppHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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
