import { useNavigate } from "react-router-dom";

import { setFiatCurrency } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";
import { Currencies } from "currencies";

import { SettingsWalletSettingsContainer } from "./SettingsWalletSettings.components";
import {
  NavigationContainer,
  Heading,
  HeadingLevel,
  Tooltip,
  Icon,
  IconName,
  Select,
  Option,
} from "@namada/components";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import { ButtonsContainer, SettingsContent } from "../Settings.components";

export const SettingsWalletSettings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const currencies: Option<string>[] = Currencies.map((currency) => ({
    value: currency.currency,
    label: `${currency.currency} - ${currency.label}`,
  }));

  const currentCurrency = useAppSelector(
    (state) => state.settings.fiatCurrency
  );

  const handleCurrencySelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = e.target;

    dispatch(setFiatCurrency(value));
  };

  return (
    <SettingsWalletSettingsContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Wallet Settings</Heading>
      </NavigationContainer>

      <SettingsContent>
        <InputContainer>
          <Select
            data={currencies}
            label={
              <div>
                Fiat Currency
                <Tooltip
                  anchor={<Icon iconName={IconName.Info} />}
                  tooltipText="Fiat currency in which balances may be displayed."
                />
              </div>
            }
            value={currentCurrency}
            onChange={handleCurrencySelect}
          ></Select>
        </InputContainer>
      </SettingsContent>
      <ButtonsContainer>
        <BackButton
          onClick={() => {
            navigate(-1);
          }}
        >
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </SettingsWalletSettingsContainer>
  );
};
