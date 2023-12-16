import { Icon, Image } from "@namada/components";
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
            <Icon size="full" fill name="ArrowLeft" />
          </ReturnIcon>
        )}

        {lockButton && (
          <LockContainer onClick={() => lock()}>
            <Icon size="full" fill name="Lock" />
          </LockContainer>
        )}

        <LogoContainer>
          <Image imageName="Logo" />
        </LogoContainer>

        {settingsButton && (
          <SettingsButton onClick={() => setOpen(true)}>
            <Icon size="full" fill name="Settings" />
          </SettingsButton>
        )}
        <AppHeaderNavigation onClose={() => setOpen(false)} open={open} />
      </HeaderContainer>
    </>
  );
};
