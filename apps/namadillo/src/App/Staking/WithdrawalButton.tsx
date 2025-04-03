import { ActionButton } from "@namada/components";
import { routes } from "App/routes";
import { useLocation, useNavigate } from "react-router-dom";

type WithdrawalButtonProps = {
  disabled: boolean;
};

export const WithdrawalButton = ({
  disabled,
}: WithdrawalButtonProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ActionButton
      size="xs"
      outlineColor="pink"
      textColor="white"
      className="py-2.5 w-40"
      disabled={disabled}
      onClick={() =>
        navigate(routes.stakingWithdrawal, {
          state: { backgroundLocation: location },
        })
      }
    >
      Withdraw
    </ActionButton>
  );
};
