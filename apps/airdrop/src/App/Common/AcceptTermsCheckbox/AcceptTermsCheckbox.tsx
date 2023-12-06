import { Checkbox } from "@namada/components";
import { TOSToggle } from "./AcceptTermsCheckbox.components";

type AcceptTermsCheckboxProps = {
  onChange: () => void;
  checked: boolean;
  disabled?: boolean;
};

export const AcceptTermsCheckbox = ({
  disabled = false,
  checked,
  onChange,
}: AcceptTermsCheckboxProps): JSX.Element => {
  return (
    <TOSToggle disabled={disabled}>
      <Checkbox disabled={disabled} checked={checked} onChange={onChange} />
      <span>
        You agree to the{" "}
        <a href="/terms-and-conditions" target="_blank">
          Terms and Conditions
        </a>{" "}
        and are not in the US or any other prohibited jurisdiction
      </span>
    </TOSToggle>
  );
};
