import { StepIndicatorContainer } from "./StepIndicator.components";

type StepIndicatorProps = {
  children: React.ReactNode;
};

export const StepIndicator = ({
  children,
}: StepIndicatorProps): JSX.Element => {
  return <StepIndicatorContainer>{children}</StepIndicatorContainer>;
};
