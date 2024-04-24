import { ActionButton, Alert, Modal, Panel } from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import { TableRowLoading } from "App/Common/TableRowLoading";
import { useStakeModule } from "hooks/useStakeModule";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { totalNamBalanceAtom, transparentAccountsAtom } from "slices/accounts";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { selectedCurrencyAtom } from "slices/settings";
import { allValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { IncrementBondingTable } from "./IncrementBondingTable";
import { ValidatorSearch } from "./ValidatorSearch";
import StakingRoutes from "./routes";

const IncrementBonding = (): JSX.Element => {
  const [filter, setFilter] = useState<string>("");
  const navigate = useNavigate();
  const totalNam = useAtomValue(totalNamBalanceAtom);
  const accounts = useAtomValue(transparentAccountsAtom);
  const validators = useAtomValue(allValidatorsAtom);
  const selectedFiatCurrency = useAtomValue(selectedCurrencyAtom);
  const selectedCurrencyRate = useAtomValue(selectedCurrencyRateAtom);

  const {
    totalUpdatedAmount,
    totalStakedAmount,
    totalNamAfterStaking,
    stakedAmountByAddress,
    updatedAmountByAddress,
    onChangeValidatorAmount,
  } = useStakeModule({ accounts });

  const onCloseModal = (): void => navigate(StakingRoutes.overview().url);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header="Select Validators to delegate your NAM"
        onClose={onCloseModal}
      >
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
          <BondingAmountOverview
            title="Available to Stake"
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
            amountInNam={totalNam}
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
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
            amountInNam={totalStakedAmount}
          />
          <BondingAmountOverview
            title="Increased Stake"
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
            updatedAmountInNam={totalUpdatedAmount}
            updatedValueClassList="text-yellow"
            amountInNam={0}
          />
        </div>
        <Panel className="w-full rounded-md flex-1">
          <div className="w-[70%]">
            <ValidatorSearch onChange={(value: string) => setFilter(value)} />
          </div>
          {validators.isLoading && <TableRowLoading count={2} />}
          {validators.isSuccess && (
            <IncrementBondingTable
              filter={filter}
              validators={validators.data}
              onChangeValidatorAmount={onChangeValidatorAmount}
              selectedCurrencyExchangeRate={selectedCurrencyRate}
              selectedFiatCurrency={selectedFiatCurrency}
              updatedAmountByAddress={updatedAmountByAddress}
              stakedAmountByAddress={stakedAmountByAddress}
            />
          )}
        </Panel>
        <ActionButton
          size="sm"
          borderRadius="sm"
          className="mt-2 w-1/4 mx-auto"
        >
          Stake
        </ActionButton>
      </ModalContainer>
    </Modal>
  );
};

export default IncrementBonding;
