import { ActionButton } from "@namada/components";
import { defaultAccountAtom } from "atoms/accounts";
import { gasLimitsAtom } from "atoms/fees";
import { createWithdrawTxAtom } from "atoms/staking";
import { useGasEstimate } from "hooks/useGasEstimate";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { MyValidator } from "types";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
};

export const WithdrawalButton = ({
  myValidator,
}: WithdrawalButtonProps): JSX.Element => {
  const change = {
    validatorId: myValidator.validator.address,
    amount: myValidator.withdrawableAmount!,
  };

  const { gasPrice } = useGasEstimate();
  const gasLimits = useAtomValue(gasLimitsAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);

  const {
    mutate: createWithdrawTx,
    isPending,
    isSuccess,
  } = useAtomValue(createWithdrawTxAtom);

  const onWithdraw = useCallback(
    async (myValidator: MyValidator) => {
      invariant(
        account,
        "Extension is not connected or you don't have an account"
      );
      invariant(gasPrice, "Gas price loading is still pending");
      invariant(gasLimits.isSuccess, "Gas limit loading is still pending");
      invariant(
        myValidator.withdrawableAmount,
        "Validator doesn't have amounts available for withdrawal"
      );
      createWithdrawTx({
        changes: [change],
        gasConfig: {
          gasPrice: gasPrice!,
          gasLimit: gasLimits.data!.Withdraw.native,
        },
        account: account!,
      });
    },
    [myValidator.withdrawableAmount, gasPrice, gasLimits.isSuccess]
  );

  return (
    <ActionButton
      size="xs"
      color="white"
      outlined
      borderRadius="sm"
      disabled={!myValidator.withdrawableAmount || isPending || isSuccess}
      onClick={() => onWithdraw(myValidator)}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {!isSuccess && !isPending && "Withdraw"}
    </ActionButton>
  );
};
