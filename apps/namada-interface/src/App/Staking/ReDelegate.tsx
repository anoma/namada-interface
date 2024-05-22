import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import { useStakeModule } from "hooks/useStakeModule";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transparentAccountsAtom } from "slices/accounts";
import { minimumGasPriceAtom } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { performReDelegationAtom } from "slices/staking";
import { allValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { ReDelegateAssignStake } from "./ReDelegateAssignStake";
import { ReDelegateRemoveStake } from "./ReDelegateRemoveStake";
import StakingRoutes from "./routes";

export const ReDelegate = (): JSX.Element => {
  const [step, setStep] = useState<"remove" | "assign">("remove");
  const stepTitle = {
    remove: "Step 1 - Remove NAM from current Validators",
    assign: "Step 2 - Assign Re-delegating NAM",
  };

  const navigate = useNavigate();
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const minimumGasPrice = useAtomValue(minimumGasPriceAtom);

  const accounts = useAtomValue(transparentAccountsAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const {
    totalStakedAmount,
    totalUpdatedAmount: totalToRedelegate,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
    myValidators,
  } = useStakeModule({ accounts });

  const {
    mutate: performRedelegation,
    isPending: isPerformingRedelegation,
    isSuccess,
  } = useAtomValue(performReDelegationAtom);

  useEffect(() => {}, [updatedAmountByAddress]);

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);

  const getValidationMessage = (): string => {
    // if (!pendingToDistribute.eq(0)) return "Invalid distribution";
    return "";
  };

  const dispatchPendingNotification = (): void => {
    dispatchNotification({
      id: "staking-redelegate",
      title: "Staking re-delegation in progress",
      description: <>The re-delegation transaction is being processed</>,
      type: "pending",
    });
  };

  const validationMessage = getValidationMessage();

  const onSubmit = (e: React.FormEvent): void => {
    // e.preventDefault();
    // invariant(
    //   accounts.length > 0,
    //   `Extension is connected but you don't have an account`
    // );
    // invariant(minimumGasPrice.isSuccess, "Gas price loading is still pending");
    // const redelegationChanges = getRedelegateChanges(
    //   stakedAmountByAddress,
    //   updatedAmountByAddress
    // );
    //
    // performRedelegation({
    //   changes: redelegationChanges,
    //   gasConfig: {
    //     gasPrice: minimumGasPrice.data!,
    //     gasLimit: GAS_LIMIT,
    //   },
    //   account: accounts[0],
    // });
  };

  useEffect(() => {
    if (isSuccess) {
      dispatchPendingNotification();
      onCloseModal();
    }
  }, [isSuccess]);

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
              title="Available to re-delegate"
              amountInNam={0}
              updatedAmountInNam={totalToRedelegate}
              updatedValueClassList="text-yellow"
              extraContent={
                <>
                  <Alert
                    type="warning"
                    className="absolute py-3 right-3 top-4 max-w-[50%] text-xs rounded-sm"
                  >
                    To proceed all re-delegated value must be assigned
                  </Alert>
                </>
              }
            />
            <BondingAmountOverview
              title="Current Stake"
              amountInNam={totalStakedAmount}
            />
            <Panel className="flex items-center h-full justify-center">
              <ActionButton
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
              updatedAmountByAddress={updatedAmountByAddress}
              stakedAmountByAddress={stakedAmountByAddress}
              onProceed={() => setStep("assign")}
            />
          )}

          {step === "assign" &&
            validators.isSuccess &&
            myValidators.isSuccess && (
              <ReDelegateAssignStake
                validators={validators.data}
                amountRemovedByAddress={updatedAmountByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
              />
            )}
        </form>
      </ModalContainer>
    </Modal>
  );
};
