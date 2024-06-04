import { ActionButton } from "@namada/components";
import { useGasEstimate } from "hooks/useGasEstimate";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";
import { defaultAccountAtom } from "slices/accounts";
import { GAS_LIMIT } from "slices/fees";
import { createWithdrawTxAtom } from "slices/staking";
import { MyValidator } from "slices/validators";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
};

export const WithdrawalButton = ({
  myValidator,
}: WithdrawalButtonProps): JSX.Element => {
  const { gasPrice } = useGasEstimate();
  const account = useAtomValue(defaultAccountAtom);
  const {
    mutate: createWithdrawTx,
    data: withdrawalTx,
    isPending,
    isSuccess,
    isIdle,
  } = useAtomValue(createWithdrawTxAtom);

  const onWithdraw = useCallback(async (myValidator: MyValidator) => {
    invariant(
      account,
      "Extension is not connected or you don't have an account"
    );
    invariant(gasPrice, "Gas price loading is still pending");
    invariant(
      myValidator.withdrawableAmount,
      "Validator doesn't have amounts available for withdrawal"
    );
    createWithdrawTx({
      changes: [
        {
          validatorId: myValidator.validator.address,
          amount: myValidator.withdrawableAmount!,
        },
      ],
      gasConfig: {
        gasPrice: gasPrice!,
        gasLimit: GAS_LIMIT,
      },
      account: account!,
    });
  }, []);

  useEffect(() => {
    if (withdrawalTx) {
      // TODO: run the transaction
    }
  }, [isSuccess]);

  return (
    <ActionButton
      size="xs"
      color="white"
      outlined
      borderRadius="sm"
      disabled={
        !myValidator.withdrawableAmount?.eq(0) ||
        isPending ||
        isSuccess ||
        !gasPrice
      }
      onClick={() => onWithdraw(myValidator)}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {isIdle && "Withdraw"}
    </ActionButton>
  );
};
