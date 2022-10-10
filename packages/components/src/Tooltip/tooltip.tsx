import { TooltipContainer, TooltipText } from "./tooltip.components";
import { TooltipProps } from "./types";

export const Tooltip = (props: TooltipProps): JSX.Element => {
  const { anchor, tooltipText } = props;

  return (
    <TooltipContainer>
      {anchor}
      <TooltipText>{tooltipText}</TooltipText>
    </TooltipContainer>
  );
};
