import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import BigNumber from "bignumber.js";
import { useStakeModule } from "hooks/useStakeModule";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { transparentAccountsAtom } from "slices/accounts";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { selectedCurrencyAtom } from "slices/settings";
import { allValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { ReDelegateTable } from "./ReDelegateTable";
import { ValidatorSearch } from "./ValidatorSearch";
import StakingRoutes from "./routes";

const ReDelegate = (): JSX.Element => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("");
  const accounts = useAtomValue(transparentAccountsAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const selectedFiatCurrency = useAtomValue(selectedCurrencyAtom);
  const selectedCurrencyRate = useAtomValue(selectedCurrencyRateAtom);
  const {
    totalStakedAmount,
    stakedAmountByAddress,
    updatedAmountByAddress,
    totalUpdatedAmount,
    onChangeValidatorAmount,
  } = useStakeModule({ accounts });

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
        header="Select amount to re-delegate"
        onClose={onCloseModal}
      >
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
          <BondingAmountOverview
            title="Available to re-delegate"
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
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
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
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
        <Panel className="w-full rounded-md flex-1">
          <div className="w-[70%]">
            <ValidatorSearch onChange={(value: string) => setFilter(value)} />
          </div>
          {validators.data && (
            <ReDelegateTable
              filter={filter}
              validators={validators.data}
              updatedAmountByAddress={updatedAmountByAddress}
              stakedAmountByAddress={stakedAmountByAddress}
              onChangeValidatorAmount={onChangeValidatorAmount}
              selectedFiatCurrency={selectedFiatCurrency}
              selectedCurrencyExchangeRate={selectedCurrencyRate}
            />
          )}
        </Panel>
        <ActionButton
          size="sm"
          color="white"
          borderRadius="sm"
          className="mt-2 w-1/4 mx-auto"
          disabled={!!validationMessage}
        >
          {validationMessage || "Re-Delegate"}
        </ActionButton>
      </ModalContainer>
    </Modal>
  );
};

export default ReDelegate;
