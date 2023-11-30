import { Icon, IconName, IconSize } from "@namada/components";
import {
  CheckboxContainer,
  CheckboxControl,
  CheckboxInput,
} from "./Checkbox.components";

type CheckboxProps = React.ComponentPropsWithRef<"input">;

export const Checkbox = ({ ...props }: CheckboxProps): JSX.Element => {
  return (
    <CheckboxContainer checked={props.checked || false}>
      <CheckboxInput type="checkbox" {...props} />
      <CheckboxControl>
        <Icon
          strokeColorOverride="currentColor"
          iconName={IconName.Checked}
          iconSize={IconSize.Full}
        />
      </CheckboxControl>
    </CheckboxContainer>
  );
};
