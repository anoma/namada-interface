import { ActionButton, Alert, Modal, Panel, Stack } from "@namada/components";
import { UnbondProps } from "@namada/types";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { TransactionFees } from "App/Common/TransactionFees";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useStakeModule } from "hooks/useStakeModule";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { defaultAccountAtom } from "slices/accounts";
import { GAS_LIMIT, minimumGasPriceAtom } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { createUnbondTxAtom } from "slices/staking";
import { MyValidator, myValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { UnstakeBondingTable } from "./UnstakeBondingTable";
import StakingRoutes from "./routes";

const Unstake = (): JSX.Element => {
  const navigate = useNavigate();
  const { data: account } = useAtomValue(defaultAccountAtom);
  const validators = useAtomValue(myValidatorsAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const minimumGasPrice = useAtomValue(minimumGasPriceAtom);
  const {
    mutate: createUnbondTx,
    isPending: isPerformingUnbond,
    data: unbondTransactionData,
    isSuccess,
  } = useAtomValue(createUnbondTxAtom);

  const {
    parseUpdatedAmounts,
    totalStakedAmount,
    stakedAmountByAddress,
    updatedAmountByAddress,
    totalUpdatedAmount,
    onChangeValidatorAmount,
  } = useStakeModule({ account });

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);

  const onUnbondAll = (): void => {
    if (!validators.isSuccess) return;
    validators.data.forEach((myValidator: MyValidator) =>
      onChangeValidatorAmount(
        myValidator.validator,
        myValidator.stakedAmount || new BigNumber(0)
      )
    );
  };

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();
    invariant(
      account,
      "Extension is not connected or you don't have an account"
    );
    invariant(minimumGasPrice.isSuccess, "Gas price loading is still pending");
    createUnbondTx({
      changes: parseUpdatedAmounts(),
      account,
      gasConfig: {
        gasPrice: minimumGasPrice.data!,
        gasLimit: GAS_LIMIT,
      },
    });
  };

  const dispatchPendingNotification = (): void => {
    dispatchNotification({
      id: "unstaking",
      title: "Unstake transaction in progress",
      description: (
        <>
          You&apos;ve unstaked&nbsp;
          <NamCurrency amount={totalUpdatedAmount} /> and the transaction is
          being processed
        </>
      ),
      type: "pending",
    });
  };

  const dispatchUnbondingTransactions = (
    transactions: TransactionPair<UnbondProps>[]
  ): void => {
    for (const tx of transactions) {
      broadcastTx(
        tx.encodedTxData.encodedTx,
        tx.signedTx,
        tx.encodedTxData.meta?.props,
        "Unbond"
      );
    }
  };

  useEffect(() => {
    if (isSuccess) {
      dispatchPendingNotification();
      unbondTransactionData &&
        dispatchUnbondingTransactions(unbondTransactionData);
      onCloseModal();
    }
  }, [isSuccess]);

  const validationMessage = ((): string => {
    if (totalStakedAmount.lt(totalUpdatedAmount)) return "Invalid amount";
    return "";
  })();

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header={
          <span className="flex items-center gap-4">
            Select amount to unstake
            <Info>
              To unstake, type the amount of NAM you wish to remove from a
              validator. Please pay attention to the unbonding period, it might
              take a few days before the amount to be available.
            </Info>
          </span>
        }
        onClose={onCloseModal}
      >
        <form
          className="grid grid-rows-[max-content_auto_max-content] h-full gap-2"
          onSubmit={onSubmit}
        >
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
            <BondingAmountOverview
              title="Amount of NAM to Unstake"
              amountInNam={0}
              updatedAmountInNam={totalUpdatedAmount}
              updatedValueClassList="text-pink"
              extraContent={
                <>
                  <Alert
                    type="removal"
                    className="absolute py-3 right-3 top-4 max-w-[50%] text-xs rounded-sm"
                  >
                    <ul className="list-disc pl-4">
                      <li className="mb-1">
                        You will not receive staking rewards
                      </li>
                      <li>It will take 21 days for the amount to be liquid</li>
                    </ul>
                  </Alert>
                </>
              }
            />
            <BondingAmountOverview
              title="Current Stake"
              amountInNam={totalStakedAmount}
            />
            <Panel className="rounded-md">
              <Stack gap={2} className="leading-none">
                <h3 className="text-sm">Unbonding period</h3>
                <div className="text-xl">21 Days</div>
                <p className="text-xs">
                  Once this period has elapsed, you may access your assets in
                  the main dashboard
                </p>
              </Stack>
            </Panel>
          </div>
          <Panel
            className={clsx(
              "grid grid-rows-[max-content_auto_max-content] overflow-hidden",
              "relative w-full rounded-md flex-1"
            )}
          >
            {validators.data && (
              <div>
                <ActionButton
                  type="button"
                  className="inline-flex w-auto leading-none px-4 py-3 mb-4"
                  color="magenta"
                  borderRadius="sm"
                  outlined
                  onClick={onUnbondAll}
                >
                  Unbond All
                </ActionButton>
              </div>
            )}
            {validators.isLoading && <TableRowLoading count={2} />}
            {validators.isSuccess && (
              <UnstakeBondingTable
                myValidators={validators.data}
                onChangeValidatorAmount={onChangeValidatorAmount}
                updatedAmountByAddress={updatedAmountByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
              />
            )}
          </Panel>
          <div className="relative">
            <ActionButton
              size="sm"
              color="white"
              borderRadius="sm"
              className="mt-2 w-1/4 mx-auto"
              disabled={
                !!validationMessage ||
                isPerformingUnbond ||
                totalUpdatedAmount.eq(0)
              }
            >
              {isPerformingUnbond ?
                "Processing..."
              : validationMessage || "Unstake"}
            </ActionButton>
            <TransactionFees
              className="absolute right-4 top-1/2 -translate-y-1/2"
              numberOfTransactions={Object.keys(updatedAmountByAddress).length}
            />
          </div>
        </form>
      </ModalContainer>
    </Modal>
  );
};

export default Unstake;
