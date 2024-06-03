import { ActionButton } from "@namada/components";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { createWithdrawTxAtom } from "slices/staking";
import { MyValidator } from "slices/validators";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
};

export const WithdrawalButton = ({
  myValidator,
}: WithdrawalButtonProps): JSX.Element => {
  const { isPending, isSuccess, isIdle } = useAtomValue(createWithdrawTxAtom);

  const onWithdraw = useCallback((_myValidator: MyValidator) => {}, []);

  return (
    <ActionButton
      size="xs"
      color="white"
      outlined
      borderRadius="sm"
      disabled={
        !myValidator.withdrawableAmount?.eq(0) || isPending || isSuccess
      }
      onClick={() => onWithdraw(myValidator)}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {isIdle && "Withdraw"}
    </ActionButton>
  );
};
