import { BaseHeading } from "./heading.components";
import { HeadingLevel } from "./types";

type HeadingProps = {
  level: HeadingLevel;
  children: React.ReactNode;
};

export const Heading = (props: HeadingProps): JSX.Element => {
  const { level, children } = props;
  return <BaseHeading as={level}>{children}</BaseHeading>;
};
