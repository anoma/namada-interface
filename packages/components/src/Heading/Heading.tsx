import { FontSize } from "@namada/utils";
import { BaseHeading } from "./Heading.components";
import { HeadingLevel } from "./types";

type HeadingProps = {
  level: HeadingLevel;
  size: keyof FontSize;
  children: React.ReactNode;
};

export const Heading = ({
  level,
  children,
  size,
}: HeadingProps): JSX.Element => {
  return (
    <BaseHeading as={level} size={size}>
      {children}
    </BaseHeading>
  );
};
