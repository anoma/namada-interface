import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { BondProps } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import NamCurrency from "App/Common/NamCurrency";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { TransactionFees } from "App/Common/TransactionFees";
import { useStakeModule } from "hooks/useStakeModule";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useValidatorSorting } from "hooks/useValidatorSorting";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, prepareTxs } from "lib/query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultAccountAtom, totalNamBalanceAtom } from "slices/accounts";
import { GAS_LIMIT, minimumGasPriceAtom } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { createBondTxAtom } from "slices/staking";
import { dispatchTransactionsAtom } from "slices/transactions";
import { allValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { IncrementBondingTable } from "./IncrementBondingTable";
import { ValidatorFilterNav } from "./ValidatorFilterNav";
import StakingRoutes from "./routes";

const IncrementBonding = (): JSX.Element => {
  const [filter, setFilter] = useState<string>("");
  const [onlyMyValidators, setOnlyMyValidators] = useState(false);
  const navigate = useNavigate();
  const totalNamBalance = useAtomValue(totalNamBalanceAtom);
  const gasPrice = useAtomValue(minimumGasPriceAtom);
  const account = useAtomValue(defaultAccountAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const dispatchTransactions = useSetAtom(dispatchTransactionsAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const resultsPerPage = 100;
  const [seed, setSeed] = useState(Math.random());

  const {
    mutate: createBondTransaction,
    isPending: isPerformingBond,
    isSuccess,
    data: bondTransactionData,
  } = useAtomValue(createBondTxAtom);

  const {
    myValidators,
    totalUpdatedAmount,
    totalStakedAmount,
    totalNamAfterStaking,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
    parseUpdatedAmounts,
  } = useStakeModule({ account });

  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: Array.from(
      new Set([
        ...Object.keys(stakedAmountByAddress),
        ...Object.keys(updatedAmountByAddress),
      ])
    ),
    searchTerm: filter,
    onlyMyValidators,
  });

  const sortedValidators = useValidatorSorting({
    validators: filteredValidators,
    updatedAmountByAddress,
    seed,
  });

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    invariant(
      account,
      "Extension is not connected or you don't have an account"
    );
    invariant(gasPrice.data, "Gas price loading is still pending");
    createBondTransaction({
      changes: parseUpdatedAmounts(),
      account,
      gasConfig: {
        gasPrice: gasPrice.data!,
        gasLimit: GAS_LIMIT,
      },
    });
  };

  const dispatchPendingNotification = (): void => {
    dispatchNotification({
      id: "staking-new",
      title: "Staking transaction in progress",
      description: (
        <>
          The staking transaction of <NamCurrency amount={totalUpdatedAmount} />{" "}
          is being processed
        </>
      ),
      type: "pending",
    });
  };

  const dispatchBondingTransactions = (
    transactions: TransactionPair<BondProps>[]
  ) => {
    dispatchTransactions(
      prepareTxs<BondProps>(transactions, (props: BondProps) => {
        const validatorAddress = shortenAddress(props.validator, 12, 8);
        return {
          success: {
            title: "Staking transaction succeeded",
            text: `Your staking transaction of ${props.amount} NAM to ${validatorAddress} has been succeeded`,
          },
          error: {
            title: "Staking transaction failed",
            text: `Your staking transaction to ${validatorAddress} has failed.`,
          },
        };
      })
    );
  };

  useEffect(() => {
    if (isSuccess) {
      dispatchPendingNotification();
      bondTransactionData && dispatchBondingTransactions(bondTransactionData);
      onCloseModal();
    }
  }, [isSuccess]);

  const errorMessage = ((): string => {
    if (totalNamBalance.isPending) return "Loading...";
    if (totalNamBalance.data!.lt(totalUpdatedAmount)) return "Invalid amount";
    return "";
  })();

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header={
          <span className="flex items-center gap-3">
            Select Validators to delegate your NAM{" "}
            <Info>
              Enter staking values across multiple validators. The total amount
              should be less than the total NAM available in your account.
              Please leave a small amount for transaction fees.
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
              title="Available to Stake"
              amountInNam={totalNamBalance.data ?? 0}
              updatedAmountInNam={totalNamAfterStaking}
              extraContent={
                <>
                  {totalNamAfterStaking.lt(GAS_LIMIT.multipliedBy(2)) && (
                    <Alert
                      type="warning"
                      className="absolute py-3 right-2 top-4 max-w-[50%] text-xs rounded-sm"
                    >
                      We recommend leaving a small amount of NAM to cover fees
                    </Alert>
                  )}
                </>
              }
            />
            <BondingAmountOverview
              title="Current Stake"
              amountInNam={totalStakedAmount}
            />
            <BondingAmountOverview
              title="Increased Stake"
              updatedAmountInNam={totalUpdatedAmount}
              updatedValueClassList="text-yellow"
              amountInNam={0}
            />
          </div>
          <Panel className="grid grid-rows-[max-content_auto] w-full relative overflow-hidden">
            {validators.isSuccess && (
              <ValidatorFilterNav
                validators={validators.data}
                updatedAmountByAddress={updatedAmountByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
                onChangeSearch={(value: string) => setFilter(value)}
                onlyMyValidators={onlyMyValidators}
                onFilterByMyValidators={setOnlyMyValidators}
                onRandomize={() => setSeed(Math.random())}
              />
            )}
            {(validators.isLoading || myValidators.isLoading) && (
              <div className="mt-3">
                <TableRowLoading count={2} />
              </div>
            )}
            {validators.isSuccess && myValidators.isSuccess && (
              <IncrementBondingTable
                resultsPerPage={resultsPerPage}
                validators={sortedValidators}
                onChangeValidatorAmount={onChangeValidatorAmount}
                updatedAmountByAddress={updatedAmountByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
              />
            )}
          </Panel>
          <div className="relative">
            <ActionButton
              type="submit"
              size="sm"
              borderRadius="sm"
              className="mt-2 w-1/4 mx-auto"
              disabled={
                !!errorMessage || isPerformingBond || totalUpdatedAmount.eq(0)
              }
            >
              {isPerformingBond ? "Processing..." : errorMessage || "Stake"}
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

export default IncrementBonding;
