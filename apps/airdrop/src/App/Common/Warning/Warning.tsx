import {
  WarningContainer,
  WarningContent,
  WarningIcon,
} from "./Warning.components";

export type WarningProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  iconWidth?: string;
  orientation?: "horizontal" | "vertical";
} & React.ComponentProps<"div">;

export const Warning = ({
  children,
  icon,
  iconWidth,
  className,
  orientation,
}: WarningProps): JSX.Element => {
  return (
    <WarningContainer className={className} orientation={orientation}>
      <WarningIcon width={iconWidth}>{icon}</WarningIcon>
      <WarningContent>{children}</WarningContent>
    </WarningContainer>
  );
};
