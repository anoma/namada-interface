import { ActionButton } from "@namada/components";
import { ButtonProps } from "./types";
import { TrustedSetupIcon } from "App/Icons/TrustedSetupIcon";
import { useNavigate } from "react-router-dom";

export const TrustedSetupButton = ({ disabled }: ButtonProps) => {
  const navigate = useNavigate();
  return (
    <ActionButton
      outlined
      disabled={disabled}
      variant="primary"
      icon={<TrustedSetupIcon />}
      onClick={() => navigate("/trusted-setup")}
    >
      Namada Trusted Setup
    </ActionButton>
  );
};
