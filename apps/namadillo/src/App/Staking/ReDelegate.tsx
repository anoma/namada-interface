import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { RedelegateMsgValue } from "@namada/types";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import { defaultAccountAtom } from "atoms/accounts";
import { defaultGasConfigFamily } from "atoms/fees";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import { createReDelegateTxAtom } from "atoms/staking";
import { allValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useStakeModule } from "hooks/useStakeModule";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { getAmountDistribution } from "lib/staking";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { TxKind, Validator } from "types";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { ReDelegateAssignStake } from "./ReDelegateAssignStake";
import { ReDelegateRemoveStake } from "./ReDelegateRemoveStake";
import StakingRoutes from "./routes";

export const ReDelegate = (): JSX.Element => {
  const [step, setStep] = useState<"remove" | "assign">("remove");
  const [amountsToAssignByAddress, setAmountToAssignByAddress] = useState<
    Record<string, BigNumber>
  >({});

  const navigate = useNavigate();
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);
  const validators = useAtomValue(allValidatorsAtom);

  const {
    totalStakedAmount,
    stakedAmountByAddress,
    totalUpdatedAmount: totalToRedelegate,
    updatedAmountByAddress: amountsRemovedByAddress,
    onChangeValidatorAmount,
    myValidators,
  } = useStakeModule({ account });

  const changes = getAmountDistribution(
    amountsRemovedByAddress,
    amountsToAssignByAddress
  );

  const gasConfig = useAtomValue(
    defaultGasConfigFamily(Array<TxKind>(changes.length).fill("Redelegation"))
  );

  const {
    mutate: createRedelegateTx,
    isPending: isCreatingTx,
    data: redelegateTxData,
    isSuccess,
    isError,
    error: redelegateTxError,
  } = useAtomValue(createReDelegateTxAtom);

  useEffect(() => {
    if (isSuccess) {
      redelegateTxData && dispatchReDelegateTransaction(redelegateTxData);
      dispatchPendingNotification(redelegateTxData);
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

  const dispatchPendingNotification = (
    data?: TransactionPair<RedelegateMsgValue>
  ): void => {
    dispatchNotification({
      id: createNotificationId(data?.encodedTxData.txs),
      title: "Staking redelegation in progress",
      description: <>Your redelegation transaction is being processed</>,
      type: "pending",
    });
  };

  useEffect(() => {
    if (isError) {
      dispatchNotification({
        id: createNotificationId(),
        title: "Staking redelegation failed",
        description: "",
        details:
          redelegateTxError instanceof Error ?
            redelegateTxError.message
          : undefined,
        type: "error",
      });
    }
  }, [isError]);

  const dispatchReDelegateTransaction = (
    tx: TransactionPair<RedelegateMsgValue>
  ): void => {
    tx.signedTxs.forEach((signedTx) => {
      broadcastTx(
        tx.encodedTxData,
        signedTx,
        tx.encodedTxData.meta?.props,
        "ReDelegate"
      );
    });
  };

  const performRedelegate = (): void => {
    invariant(account, `Extension is connected but you don't have an account`);

    if (changes.length === 0) {
      throw new Error("No redelegation changes to make");
    }

    if (!gasConfig.isSuccess) {
      throw new Error("Gas config loading is still pending");
    }

    createRedelegateTx({
      changes,
      gasConfig: gasConfig.data,
      account,
    });
  };

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Go to next page or do nothing
    if (step === "remove" && totalToRedelegate) {
      if (totalToRedelegate.gt(0)) {
        setStep("assign");
      }
      return;
    }
    performRedelegate();
  };

  const totalAssignedAmounts = BigNumber.sum(
    new BigNumber(0),
    ...Object.values(amountsToAssignByAddress)
  );

  const stepTitle = {
    remove: "Step 1 - Remove NAM from current Validators",
    assign: "Step 2 - Assign Redelegating NAM",
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
          <header className="grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-1.5">
            <BondingAmountOverview
              title="Total amount to redelegate"
              className="col-span-2"
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
                      To proceed, all redelegated value must be assigned
                    </Alert>
                  </>
                )
              }
            />
            <BondingAmountOverview
              title="Current Stake"
              amountInNam={totalStakedAmount}
            />
            <Panel className="flex items-center h-full justify-center rounded-md">
              <ActionButton
                type="button"
                className="w-32 mx-auto"
                backgroundColor="white"
                backgroundHoverColor="pink"
                size="sm"
                onClick={() => navigate(StakingRoutes.unstake().url)}
              >
                Unstake
              </ActionButton>
            </Panel>
          </header>

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
                redelegateChanges={changes}
                gasConfig={gasConfig}
              />
            )}
        </form>
      </ModalContainer>
    </Modal>
  );
};
