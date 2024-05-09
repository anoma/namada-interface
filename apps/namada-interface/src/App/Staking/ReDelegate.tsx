import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { useStakeModule } from "hooks/useStakeModule";
import { useValidatorFilter } from "hooks/useValidatorFilter";
import { useValidatorSorting } from "hooks/useValidatorSorting";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import {
  getPendingToDistributeAmount,
  getRedelegateChanges,
} from "lib/staking";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transparentAccountsAtom } from "slices/accounts";
import { GAS_LIMIT, minimumGasPriceAtom } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { performReDelegationAtom } from "slices/staking";
import { allValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { ReDelegateTable } from "./ReDelegateTable";
import { ValidatorFilterNav } from "./ValidatorFilterNav";
import StakingRoutes from "./routes";

const ReDelegate = (): JSX.Element => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("");
  const [onlyMyValidators, setOnlyMyValidators] = useState(false);
  const [seed, setSeed] = useState(Math.random());
  const accounts = useAtomValue(transparentAccountsAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const minimumGasPrice = useAtomValue(minimumGasPriceAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const {
    totalStakedAmount,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
  } = useStakeModule({ accounts });

  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: Object.keys(stakedAmountByAddress),
    searchTerm: filter,
    onlyMyValidators,
  });

  const sortedValidators = useValidatorSorting({
    validators: filteredValidators,
    stakedAmountByAddress,
    updatedAmountByAddress,
    seed,
  });

  const {
    mutate: performRedelegation,
    isPending: isPerformingRedelegation,
    isSuccess,
  } = useAtomValue(performReDelegationAtom);

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);
  const pendingToDistribute = getPendingToDistributeAmount(
    stakedAmountByAddress,
    updatedAmountByAddress
  );

  const getValidationMessage = (): string => {
    if (!pendingToDistribute.eq(0)) return "Invalid distribution";
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
    e.preventDefault();
    invariant(
      accounts.length > 0,
      `Extension is connected but you don't have an account`
    );
    invariant(minimumGasPrice.isSuccess, "Gas price loading is still pending");
    const redelegationChanges = getRedelegateChanges(
      stakedAmountByAddress,
      updatedAmountByAddress
    );
    performRedelegation({
      changes: redelegationChanges,
      gasConfig: {
        gasPrice: minimumGasPrice.data!,
        gasLimit: GAS_LIMIT,
      },
      account: accounts[0],
    });
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
            Select amount to re-delegate
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
              updatedAmountInNam={pendingToDistribute}
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
          <Panel className="grid grid-rows-[max-content_auto] overflow-hidden w-full rounded-md relative">
            <ValidatorFilterNav
              onChangeSearch={(value: string) => setFilter(value)}
              onlyMyValidators={onlyMyValidators}
              onFilterByMyValidators={setOnlyMyValidators}
              onRandomize={() => setSeed(Math.random())}
            />
            {validators.isLoading && (
              <div className="mt-3">
                <TableRowLoading count={2} />
              </div>
            )}
            {validators.isSuccess && (
              <ReDelegateTable
                validators={sortedValidators}
                updatedAmountByAddress={updatedAmountByAddress}
                stakedAmountByAddress={stakedAmountByAddress}
                onChangeValidatorAmount={onChangeValidatorAmount}
              />
            )}
          </Panel>
          <ActionButton
            size="sm"
            color="white"
            borderRadius="sm"
            className="mt-2 w-1/4 mx-auto"
            disabled={
              !!validationMessage ||
              !pendingToDistribute.eq(0) ||
              isPerformingRedelegation
            }
          >
            {validationMessage || "Re-Delegate"}
          </ActionButton>
        </form>
      </ModalContainer>
    </Modal>
  );
};

export default ReDelegate;
