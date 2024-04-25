import { ActionButton, Alert, Modal, Panel, Stack } from "@namada/components";
import { Info } from "App/Common/Info";
import { ModalContainer } from "App/Common/ModalContainer";
import { TableRowLoading } from "App/Common/TableRowLoading";
import BigNumber from "bignumber.js";
import { useStakeModule } from "hooks/useStakeModule";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { transparentAccountsAtom } from "slices/accounts";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { selectedCurrencyAtom } from "slices/settings";
import { MyValidator, myValidatorsAtom } from "slices/validators";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { UnstakeBondingTable } from "./UnstakeBondingTable";
import StakingRoutes from "./routes";

const Unstake = (): JSX.Element => {
  const navigate = useNavigate();
  const accounts = useAtomValue(transparentAccountsAtom);
  const validators = useAtomValue(myValidatorsAtom);
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

  const onUnbondAll = (): void => {
    if (!validators.isSuccess) return;
    validators.data.forEach((myValidator: MyValidator) =>
      onChangeValidatorAmount(
        myValidator.validator,
        myValidator.stakedAmount || new BigNumber(0)
      )
    );
  };

  const getValidationMessage = (): string => {
    if (totalStakedAmount.lt(totalUpdatedAmount)) return "Invalid amount";
    return "";
  };

  const validationMessage = getValidationMessage();

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
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
          <BondingAmountOverview
            title="Amount of NAM to Unstake"
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
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
            selectedFiatCurrency={selectedFiatCurrency}
            fiatExchangeRate={selectedCurrencyRate}
            amountInNam={totalStakedAmount}
          />
          <Panel>
            <Stack gap={2} className="leading-none">
              <h3 className="text-sm">Unbonding period</h3>
              <div className="text-xl">21 Days</div>
              <p className="text-xs">
                Once this period has elapsed, you may access your assets in the
                main dashboard
              </p>
            </Stack>
          </Panel>
        </div>
        <Panel className="w-full rounded-md flex-1">
          {validators.data && (
            <ActionButton
              className="inline-flex w-auto leading-none px-4 py-3 mb-4"
              color="magenta"
              borderRadius="sm"
              outlined
              onClick={onUnbondAll}
            >
              Unbond All
            </ActionButton>
          )}
          {validators.isLoading && <TableRowLoading count={2} />}
          {validators.isSuccess && (
            <UnstakeBondingTable
              myValidators={validators.data}
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
          color="white"
          borderRadius="sm"
          className="mt-2 w-1/4 mx-auto"
          disabled={!!validationMessage}
        >
          {validationMessage || "Unstake"}
        </ActionButton>
      </ModalContainer>
    </Modal>
  );
};

export default Unstake;
