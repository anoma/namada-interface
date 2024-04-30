import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import BigNumber from "bignumber.js";
import { useStakeModule } from "hooks/useStakeModule";
import useValidatorFilter from "hooks/useValidatorFilter";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { transparentAccountsAtom } from "slices/accounts";
import { allValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { ReDelegateTable } from "./ReDelegateTable";
import { ValidatorFilterNav } from "./ValidatorFilterNav";
import StakingRoutes from "./routes";

const ReDelegate = (): JSX.Element => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("");
  const [onlyMyValidators, setOnlyMyValidators] = useState(false);
  const accounts = useAtomValue(transparentAccountsAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const {
    totalStakedAmount,
    stakedAmountByAddress,
    updatedAmountByAddress,
    totalUpdatedAmount,
    onChangeValidatorAmount,
  } = useStakeModule({ accounts });

  const filteredValidators = useValidatorFilter({
    validators: validators.isSuccess ? validators.data : [],
    myValidatorsAddresses: Object.keys(stakedAmountByAddress),
    searchTerm: filter,
    onlyMyValidators,
  });

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);
  const redelegateTotal = totalStakedAmount.minus(totalUpdatedAmount);
  const redelegateDisplayedAmount =
    totalUpdatedAmount.gt(0) ?
      BigNumber.max(0, redelegateTotal)
    : new BigNumber(0);

  const getValidationMessage = (): string => {
    if (redelegateTotal.lt(0)) return "Invalid amount";
    if (redelegateTotal.gt(0)) return "Invalid distribution";
    return "";
  };

  const validationMessage = getValidationMessage();

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
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
          <BondingAmountOverview
            title="Available to re-delegate"
            amountInNam={0}
            updatedAmountInNam={redelegateDisplayedAmount}
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
        <Panel className="w-full rounded-md flex-1 relative">
          <ValidatorFilterNav
            onChangeSearch={(value: string) => setFilter(value)}
            onlyMyValidators={onlyMyValidators}
            onFilterByMyValidators={setOnlyMyValidators}
          />
          {validators.data && (
            <ReDelegateTable
              validators={filteredValidators}
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
          disabled={!!validationMessage || !redelegateTotal.eq(0)}
        >
          {validationMessage || "Re-Delegate"}
        </ActionButton>
      </ModalContainer>
    </Modal>
  );
};

export default ReDelegate;
