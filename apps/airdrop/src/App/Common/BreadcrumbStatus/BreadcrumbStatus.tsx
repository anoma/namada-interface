import { Icon, IconName, IconSize } from "@namada/components";
import {
  BreadcrumbStatusContainer,
  BreadcrumbStatusIndicator,
} from "./BreadcrumbStatus.component";

type BreadcrumbStatusProps = {
  active: boolean;
  accepted?: boolean;
  rejected?: boolean;
  children: React.ReactNode;
};

export const BreadcrumbStatus = ({
  active,
  accepted,
  rejected,
  children,
}: BreadcrumbStatusProps): JSX.Element => {
  return (
    <BreadcrumbStatusContainer active={active}>
      <BreadcrumbStatusIndicator>
        {accepted && (
          <Icon
            iconName={IconName.Checked}
            strokeColorOverride="black"
            iconSize={IconSize.S}
          />
        )}
        {rejected && (
          <Icon
            iconName={IconName.Close}
            fillColorOverride="black"
            iconSize={IconSize.S}
          />
        )}
      </BreadcrumbStatusIndicator>
      {children}
    </BreadcrumbStatusContainer>
  );
};
