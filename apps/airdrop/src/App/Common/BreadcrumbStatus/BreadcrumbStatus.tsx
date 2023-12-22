import { Icon } from "@namada/components";
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
          <Icon name="Checked" strokeColorOverride="black" size="sm" />
        )}
        {rejected && <Icon name="Close" fillColorOverride="black" size="sm" />}
      </BreadcrumbStatusIndicator>
      {children}
    </BreadcrumbStatusContainer>
  );
};
