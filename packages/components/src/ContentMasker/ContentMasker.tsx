import { Icon, IconName, IconSize } from "@namada/components";
import {
  BlurredContainer,
  ContentMaskerContainer,
  EyeIcon,
} from "./ContentMasker.components";
import { ThemeColor } from "@namada/utils";

type ContentMaskerType = {
  children: React.ReactNode;
  themeColor?: ThemeColor;
};

export const ContentMasker = ({
  children,
  themeColor,
}: ContentMaskerType): JSX.Element => {
  return (
    <ContentMaskerContainer themeColor={themeColor}>
      <BlurredContainer>{children}</BlurredContainer>
      <EyeIcon>
        <Icon
          strokeColorOverride="currentColor"
          iconName={IconName.EyeHidden}
          iconSize={IconSize.Full}
        />
      </EyeIcon>
    </ContentMaskerContainer>
  );
};
