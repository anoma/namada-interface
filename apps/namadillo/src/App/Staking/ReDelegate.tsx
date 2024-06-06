import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { RedelegateMsgValue } from "@namada/types";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useGasEstimate } from "hooks/useGasEstimate";
import { useStakeModule } from "hooks/useStakeModule";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { getAmountDistribution } from "lib/staking";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultAccountAtom } from "slices/accounts";
import { GAS_LIMIT } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { createReDelegateTxAtom } from "slices/staking";
import { Validator, allValidatorsAtom } from "slices/validators";
import { twMerge } from "tailwind-merge";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { ReDelegateAssignStake } from "./ReDelegateAssignStake";
import { ReDelegateRemoveStake } from "./ReDelegateRemoveStake";
import StakingRoutes from "./routes";

export const ReDelegate = (): JSX.Element => {
  const [step, setStep] = useState<"remove" | "assign">("remove");
  const [amountsToAssignByAddress, setAmountToAssignByAddress] = useState<
    Record<string, BigNumber>
  >({});

  const { gasPrice } = useGasEstimate();
  const navigate = useNavigate();
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const {
    totalStakedAmount,
    totalUpdatedAmount: totalToRedelegate,
    stakedAmountByAddress,
    updatedAmountByAddress: amountsRemovedByAddress,
    onChangeValidatorAmount,
    myValidators,
  } = useStakeModule({ account });

  const {
    mutate: createRedelegateTx,
    isPending: isCreatingTx,
    data: redelegateTxData,
    isSuccess,
  } = useAtomValue(createReDelegateTxAtom);

  useEffect(() => {
    if (isSuccess) {
      dispatchPendingNotification();
      redelegateTxData && dispatchReDelegateTransactions(redelegateTxData);
      onCloseModal();
    }
  }, [isSuccess]);

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);

  const onAssignAmount = (
    validator: Validator,
    amount: BigNumber | undefined
  ): void => {
    setAmountToAssignByAddress((amounts) => {
      if (amount === undefined) {
        delete amounts[validator.address];
        return { ...amounts };
      }

      return {
        ...amounts,
        [validator.address]: amount,
      };
    });
  };

  const dispatchPendingNotification = (): void => {
    dispatchNotification({
      id: "staking-redelegate",
      title: "Staking re-delegation in progress",
      description: <>The re-delegation transaction is being processed</>,
      type: "pending",
    });
  };

  const dispatchReDelegateTransactions = (
    transactions: TransactionPair<RedelegateMsgValue>[]
  ): void => {
    for (const tx of transactions) {
      broadcastTx(
        tx.encodedTxData.encodedTx,
        tx.signedTx,
        tx.encodedTxData.meta?.props,
        "ReDelegate"
      );
    }
  };

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    invariant(account, `Extension is connected but you don't have an account`);
    invariant(gasPrice, "Gas price loading is still pending");
    const redelegationChanges = getAmountDistribution(
      amountsRemovedByAddress,
      amountsToAssignByAddress
    );
    createRedelegateTx({
      changes: redelegationChanges,
      gasConfig: {
        gasPrice: gasPrice,
        gasLimit: GAS_LIMIT,
      },
      account,
    });
  };

  const totalAssignedAmounts = BigNumber.sum(
    new BigNumber(0),
    ...Object.values(amountsToAssignByAddress)
  );

  const stepTitle = {
    remove: "Step 1 - Remove NAM from current Validators",
    assign: "Step 2 - Assign Re-delegating NAM",
  };

  const totalUpdatedAmount = totalToRedelegate.minus(totalAssignedAmounts);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header={
          <span className="flex items-center gap-4">
            {stepTitle[step]}
            <Info>
              You can edit the amounts between validators. You can&apos;t
              increase or reduce the total staked amount, so pay attention to
              the correct distribution.
            </Info>
          </span>
        }
        onClose={onCloseModal}
      >
        <form
          onSubmit={onSubmit}
          className="grid grid-rows-[max-content_auto_max-content] gap-2 h-full"
        >
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
            <BondingAmountOverview
              title="Total amount to re-delegate"
              amountInNam={0}
              updatedAmountInNam={totalUpdatedAmount}
              updatedValueClassList={twMerge(
                clsx("text-yellow", {
                  "text-fail": totalUpdatedAmount.lt(0),
                })
              )}
              extraContent={
                step === "assign" && (
                  <>
                    <Alert
                      type="warning"
                      className="absolute py-3 right-3 top-4 max-w-[50%] text-xs rounded-sm"
                    >
                      To proceed, all re-delegated value must be assigned
                    </Alert>
                  </>
                )
              }
            />
            <BondingAmountOverview
              title="Current Stake"
              amountInNam={totalStakedAmount}
            />
            <Panel className="flex items-center h-full justify-center">
              <ActionButton
                type="button"
                className="w-32 mx-auto"
                color="white"
                size="sm"
                borderRadius="sm"
                onClick={() => navigate(StakingRoutes.unstake().url)}
              >
                Unstake
              </ActionButton>
            </Panel>
          </div>

          {step === "remove" && (
            <ReDelegateRemoveStake
              onChangeValidatorAmount={onChangeValidatorAmount}
              amountsRemovedByAddress={amountsRemovedByAddress}
              stakedAmountByAddress={stakedAmountByAddress}
              onProceed={() => setStep("assign")}
            />
          )}

          {step === "assign" &&
            validators.isSuccess &&
            myValidators.isSuccess && (
              <ReDelegateAssignStake
                validators={validators.data}
                amountsRemovedByAddress={amountsRemovedByAddress}
                assignedAmountsByAddress={amountsToAssignByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
                totalToRedelegate={totalToRedelegate}
                totalAssignedAmounts={totalAssignedAmounts}
                onChangeAssignedAmount={onAssignAmount}
                isPerformingRedelegation={isCreatingTx}
              />
            )}
        </form>
      </ModalContainer>
    </Modal>
  );
};
