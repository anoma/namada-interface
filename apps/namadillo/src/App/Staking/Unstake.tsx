import { ActionButton, Alert, Modal, Panel, Stack } from "@namada/components";
import { UnbondMsgValue, UnbondProps } from "@namada/types";
import { singleUnitDurationFromInterval } from "@namada/utils/helpers";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { TransactionFees } from "App/Common/TransactionFees";
import { defaultAccountAtom } from "atoms/accounts";
import { chainParametersAtom } from "atoms/chain";
import { defaultGasConfigFamily } from "atoms/fees";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import { createUnbondTxAtom } from "atoms/staking";
import { myValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useStakeModule } from "hooks/useStakeModule";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EpochInfo, MyValidator } from "types";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { UnstakeBondingTable } from "./UnstakeBondingTable";
import StakingRoutes from "./routes";

const getUnbondPeriod = ({
  unbondingPeriodInEpochs,
  minEpochDuration,
}: EpochInfo): string => {
  const duration = unbondingPeriodInEpochs * minEpochDuration;
  return singleUnitDurationFromInterval(0, duration);
};

const Unstake = (): JSX.Element => {
  const navigate = useNavigate();
  const { data: account } = useAtomValue(defaultAccountAtom);
  const validators = useAtomValue(myValidatorsAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const { data: chainParameters } = useAtomValue(chainParametersAtom);

  const {
    mutate: createUnbondTx,
    isPending: isPerformingUnbond,
    data: unbondTransactionData,
    isSuccess,
    isError,
    error: unstakeTxError,
  } = useAtomValue(createUnbondTxAtom);

  const {
    parseUpdatedAmounts,
    totalStakedAmount,
    stakedAmountByAddress,
    updatedAmountByAddress,
    totalUpdatedAmount,
    onChangeValidatorAmount,
  } = useStakeModule({ account });

  const gasConfig = useAtomValue(
    defaultGasConfigFamily(
      Array(Object.keys(updatedAmountByAddress).length).fill("Unbond")
    )
  );

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
    const changes = parseUpdatedAmounts();

    if (!gasConfig.isSuccess) {
      throw new Error("Gas config loading is still pending");
    }

    createUnbondTx({
      changes,
      account,
      gasConfig: gasConfig.data,
    });
  };

  const dispatchPendingNotification = (
    data?: TransactionPair<UnbondMsgValue>
  ): void => {
    dispatchNotification({
      id: createNotificationId(data?.encodedTxData.txs),
      title: "Unstake transaction in progress",
      description: (
        <>
          Your unstaking transaction of{" "}
          <NamCurrency amount={totalUpdatedAmount} /> is being processed
        </>
      ),
      type: "pending",
    });
  };

  useEffect(() => {
    if (isError) {
      dispatchNotification({
        id: createNotificationId(),
        title: "Unstake transaction failed",
        description: "",
        details:
          unstakeTxError instanceof Error ? unstakeTxError.message : undefined,
        type: "error",
      });
    }
  }, [isError]);

  const dispatchUnbondingTransaction = (
    tx: TransactionPair<UnbondProps>
  ): void => {
    tx.signedTxs.forEach((signedTx) => {
      broadcastTx(
        tx.encodedTxData,
        signedTx,
        tx.encodedTxData.meta?.props,
        "Unbond"
      );
    });
  };

  useEffect(() => {
    if (isSuccess) {
      unbondTransactionData &&
        dispatchUnbondingTransaction(unbondTransactionData);
      dispatchPendingNotification(unbondTransactionData);
      onCloseModal();
    }
  }, [isSuccess]);

  const validationMessage = ((): string => {
    if (totalStakedAmount.lt(totalUpdatedAmount)) return "Invalid amount";

    for (const address in updatedAmountByAddress) {
      if (stakedAmountByAddress[address].lt(updatedAmountByAddress[address])) {
        return "Invalid amount";
      }
    }
    return "";
  })();

  const unbondPeriod =
    chainParameters ? getUnbondPeriod(chainParameters.epochInfo) : "N/A";

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header={
          <span className="flex items-center gap-4">
            Select amount to unstake
            <Info>
              To unstake, type the amount of NAM you wish to remove from a
              validator. Pay attention to the unbonding period; it might take a
              few days for the amount to become available.
            </Info>
          </span>
        }
        onClose={onCloseModal}
      >
        <form
          className="grid grid-rows-[max-content_auto_max-content] h-full gap-2"
          onSubmit={onSubmit}
        >
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-1.5">
            <BondingAmountOverview
              title="Amount of NAM to Unstake"
              className="col-span-2"
              stackClassName="grid grid-rows-[auto_auto_auto]"
              amountInNam={0}
              updatedAmountInNam={totalUpdatedAmount}
              updatedValueClassList="text-pink"
              extraContent={
                <>
                  <Alert
                    type="removal"
                    className={clsx(
                      "py-3 right-3 top-4 max-w-[240px] text-xs rounded-sm",
                      "md:col-start-2 md:row-span-full md:justify-self-end"
                    )}
                  >
                    <ul className="list-disc pl-4">
                      <li className="mb-1">
                        You will not receive staking rewards
                      </li>
                      <li>
                        It will take {unbondPeriod} for the amount to be liquid
                      </li>
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
                <div className="text-xl">{unbondPeriod}</div>
                <p className="text-xs">
                  Once this period has elapsed, you can access your assets in
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
                  outlineColor="pink"
                  textHoverColor="white"
                  onClick={onUnbondAll}
                >
                  Unbond All
                </ActionButton>
              </div>
            )}
            {validators.isLoading && <TableRowLoading count={2} />}
            <AtomErrorBoundary
              result={validators}
              niceError="Unable to load your validators list"
            >
              {validators.isSuccess && (
                <UnstakeBondingTable
                  myValidators={validators.data}
                  onChangeValidatorAmount={onChangeValidatorAmount}
                  updatedAmountByAddress={updatedAmountByAddress}
                  stakedAmountByAddress={stakedAmountByAddress}
                />
              )}
            </AtomErrorBoundary>
          </Panel>
          <div className="relative grid grid-cols-[1fr_25%_1fr] items-center">
            <ActionButton
              size="sm"
              backgroundColor="white"
              backgroundHoverColor="pink"
              className="mt-2 col-start-2"
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
            {gasConfig.isSuccess && (
              <TransactionFees
                className="justify-self-end px-4"
                gasConfig={gasConfig.data}
              />
            )}
          </div>
        </form>
      </ModalContainer>
    </Modal>
  );
};

export default Unstake;
