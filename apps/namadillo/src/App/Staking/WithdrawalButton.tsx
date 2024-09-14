import { ActionButton } from "@namada/components";
import { WithdrawMsgValue } from "@namada/types";
import { NamCurrency } from "App/Common/NamCurrency";
import { defaultAccountAtom } from "atoms/accounts";
import { createWithdrawTxAtomFamily } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { MyValidator, UnbondEntry } from "types";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
  unbondingEntry: UnbondEntry;
};

export const WithdrawalButton = ({
  myValidator,
  unbondingEntry,
}: WithdrawalButtonProps): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);

  const getFamilyId = (): string =>
    `${myValidator.validator.address}- ${unbondingEntry.amount}`;

  const parseWithdrawParams = (): WithdrawMsgValue[] => {
    if (!account?.address) return [];
    return [
      { validator: myValidator.validator.address, source: account?.address },
    ];
  };

  const {
    execute: performWithdraw,
    isPending,
    isSuccess,
    isEnabled,
  } = useTransaction({
    createTxAtom: createWithdrawTxAtomFamily(getFamilyId()),
    params: parseWithdrawParams(),
    eventType: "Withdraw",
    parsePendingTxNotification: () => ({
      title: "Withdrawal transaction in progress",
      description: (
        <>
          The withdrawal of{" "}
          <NamCurrency amount={unbondingEntry.amount || new BigNumber(0)} /> is
          being processed
        </>
      ),
    }),
    parseErrorTxNotification: () => ({
      title: "Withdrawal transaction failed",
      description: "",
    }),
  });

  useEffect(() => {
    return () => {
      // On detach we have to remove the param to avoid memory leaks
      createWithdrawTxAtomFamily.remove(getFamilyId());
    };
  }, []);

  const onWithdraw = (): void => {
    performWithdraw();
  };

  return (
    <ActionButton
      size="xs"
      outlineColor="white"
      disabled={!unbondingEntry.canWithdraw || !isEnabled}
      onClick={() => onWithdraw()}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {!isSuccess && !isPending && "Withdraw"}
    </ActionButton>
  );
};
