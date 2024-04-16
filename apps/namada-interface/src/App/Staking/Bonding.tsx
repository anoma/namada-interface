import {
  ActionButton,
  Heading,
  Modal,
  ProgressIndicator,
} from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { totalNamBalanceAtom } from "slices/accounts";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { selectedCurrencyAtom } from "slices/settings";
import { getStakingTotalAtom } from "slices/staking";
import {
  fetchAllValidatorsAtom,
  fetchMyValidatorsAtom,
} from "slices/validators";
import { useLoadable } from "store/hooks";
import { BondingAmountOverview } from "./BondingAmountOverview";
import { BondingValidatorsTable } from "./BondingValidatorsTable";
import StakingRoutes from "./routes";

export const Bonding = (): JSX.Element => {
  const navigate = useNavigate();
  const totalNam = useAtomValue(totalNamBalanceAtom);
  const selectedFiatCurrency = useAtomValue(selectedCurrencyAtom);
  const selectedCurrencyRate = useAtomValue(selectedCurrencyRateAtom);
  const validators = useLoadable(fetchAllValidatorsAtom);
  const totalStakedValue = useAtomValue(getStakingTotalAtom);
  useLoadable(fetchMyValidatorsAtom);

  const header = (
    <>
      <div className="left-0 absolute">
        <ProgressIndicator
          keyName="bonding-steps"
          totalSteps={2}
          currentStep={1}
        />
      </div>
      <Heading>Select Validators to delegate your NAM</Heading>
    </>
  );

  return (
    <Modal onClose={() => navigate(StakingRoutes.overview().url)}>
      <ModalContainer header={header}>
        <div className="flex gap-2">
          <BondingAmountOverview
            title="Available NAM to Stake"
            selectedFiatCurrency={selectedFiatCurrency}
            amountInNam={totalNam}
            amountInFiat={totalNam.multipliedBy(selectedCurrencyRate)}
          />
          {/* TODO: Implement current staked amount  */}
          <BondingAmountOverview
            title="Current Staked Amount"
            selectedFiatCurrency={selectedFiatCurrency}
            amountInNam={totalStakedValue.totalBonded}
            amountInFiat={totalStakedValue.totalBonded.multipliedBy(
              selectedCurrencyRate
            )}
          />
        </div>
        {validators.state === "hasData" && (
          <BondingValidatorsTable validators={validators.data} />
        )}
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
