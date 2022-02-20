import { ToggleCircle, ToggleContainer, ToggleText } from "./styledComponents";

export type ToggleProps = {
  checked: boolean;
  onClick: () => void;
  id?: string;

  isDisabled?: boolean;

  dataTestId?: string;

  circleElementEnabled?: JSX.Element;
  circleElementDisabled?: JSX.Element;
};

const Toggle: React.FunctionComponent<ToggleProps> = (props: ToggleProps) => {
  const {
    checked,
    onClick,
    dataTestId,
    circleElementEnabled,
    circleElementDisabled,
  } = props;
  const circleElement = checked ? circleElementEnabled : circleElementDisabled;
  // TODO: animate the change of circleElement
  return (
    <ToggleContainer
      data-testid={dataTestId}
      role="switch"
      aria-checked={checked}
      checked={checked}
      onClick={() => {
        onClick();
      }}
    >
      <ToggleCircle checked={checked}>{circleElement}</ToggleCircle>
    </ToggleContainer>
  );
};

export default Toggle;
