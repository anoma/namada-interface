import { Heading, Modal, Panel, ProgressIndicator } from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { totalNamBalanceAtom } from "slices/accounts";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { selectedCurrencyAtom } from "slices/settings";
import { BondingAmountOverview } from "./BondingAmountOverview";
import StakingRoutes from "./routes";

export const Bonding = (): JSX.Element => {
  const navigate = useNavigate();
  const totalNam = useAtomValue(totalNamBalanceAtom);
  const selectedFiatCurrency = useAtomValue(selectedCurrencyAtom);
  const selectedCurrencyRate = useAtomValue(selectedCurrencyRateAtom);

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
            amountInNam={totalNam}
            amountInFiat={totalNam.multipliedBy(selectedCurrencyRate)}
          />
        </div>
        <Panel className="rounded-md">Validator table goes here o/</Panel>
      </ModalContainer>
    </Modal>
  );
};
