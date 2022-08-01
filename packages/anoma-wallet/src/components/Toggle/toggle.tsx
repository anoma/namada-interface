import { ToggleCircle, ToggleContainer } from "./toggle.components";

export type ToggleProps = {
  // indicates whether it is enabled/disabled. checked = enabled
  checked: boolean;
  // cb for when clicked
  onClick: () => void;
  // custom element to be placed in circle when enabled
  circleElementEnabled?: JSX.Element;
  // custom element to be placed in circle when disabled
  circleElementDisabled?: JSX.Element;
  testId?: string;
};

/**
 * a component to indicate true/false
 */
const Toggle: React.FunctionComponent<ToggleProps> = (props: ToggleProps) => {
  const {
    checked,
    onClick,
    circleElementEnabled,
    circleElementDisabled,
    testId,
  } = props;
  const circleElement = checked ? circleElementEnabled : circleElementDisabled;
  // TODO: animate the change of circleElement
  return (
    <ToggleContainer
      role="switch"
      aria-checked={checked}
      checked={checked}
      onClick={() => {
        onClick();
      }}
      data-testid={`Toggle${testId ? `testId-${testId}` : ""}`}
    >
      <ToggleCircle checked={checked}>{circleElement}</ToggleCircle>
    </ToggleContainer>
  );
};

export default Toggle;
