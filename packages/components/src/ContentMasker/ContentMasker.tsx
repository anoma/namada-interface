import { Icon, IconName, IconSize } from "@namada/components";
import {
  BlurredContainer,
  ContentMaskerContainer,
  EyeIcon,
} from "./ContentMasker.components";

type ContentMaskerType = {
  children: React.ReactNode;
};

export const ContentMasker = ({ children }: ContentMaskerType): JSX.Element => {
  return (
    <ContentMaskerContainer>
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
