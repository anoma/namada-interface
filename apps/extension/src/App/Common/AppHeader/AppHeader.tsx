import { Icon, IconName, Image, ImageName } from "@namada/components";
import {
  HeaderContainer,
  LogoContainer,
  ReturnIcon,
} from "./AppHeader.components";
import { useNavigate } from "react-router-dom";

type AppHeaderProps = {
  returnButton: boolean;
};

export const AppHeader = ({ returnButton }: AppHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  return (
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
    </HeaderContainer>
  );
};
