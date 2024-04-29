import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import NamCurrency from "App/Common/NamCurrency";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { useStakeModule } from "hooks/useStakeModule";
import useValidatorFilter from "hooks/useValidatorFilter";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { totalNamBalanceAtom, transparentAccountsAtom } from "slices/accounts";
import { GAS_LIMIT, minimumGasPriceAtom } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { performBondAtom } from "slices/staking";
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
  const accounts = useAtomValue(transparentAccountsAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const minimumGasPrice = useAtomValue(minimumGasPriceAtom);
  const {
    mutate: performBond,
    isPending: isPerformingBond,
    isSuccess,
  } = useAtomValue(performBondAtom);

  const {
    totalUpdatedAmount,
    totalStakedAmount,
    totalNamAfterStaking,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
    parseUpdatedAmounts,
  } = useStakeModule({ accounts });

  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: Object.keys(stakedAmountByAddress),
    searchTerm: filter,
    onlyMyValidators,
  });

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    invariant(
      accounts.length > 0,
      "Extension is not connected or you don't have an account"
    );
    invariant(minimumGasPrice.isSuccess, "Gas price loading is still pending");
    performBond({
      changes: parseUpdatedAmounts(),
      account: accounts[0],
      gasConfig: {
        gasPrice: minimumGasPrice.data!,
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

  useEffect(() => {
    if (isSuccess) {
      dispatchPendingNotification();
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
        <form onSubmit={onSubmit} className="flex flex-col flex-1 gap-2 h-full">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
            <BondingAmountOverview
              title="Available to Stake"
              amountInNam={totalNamBalance.data ?? 0}
              updatedAmountInNam={totalNamAfterStaking}
              extraContent={
                <>
                  {totalNamAfterStaking.lt(2) && (
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
          <Panel className="w-full rounded-md flex-1">
            <ValidatorFilterNav
              onChangeSearch={(value: string) => setFilter(value)}
              onlyMyValidators={onlyMyValidators}
              onFilterByMyValidators={setOnlyMyValidators}
            />
            {validators.isLoading && <TableRowLoading count={2} />}
            {validators.isSuccess && (
              <IncrementBondingTable
                validators={filteredValidators}
                onChangeValidatorAmount={onChangeValidatorAmount}
                updatedAmountByAddress={updatedAmountByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
              />
            )}
          </Panel>
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
        </form>
      </ModalContainer>
    </Modal>
  );
};

export default IncrementBonding;
