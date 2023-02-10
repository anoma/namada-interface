import { useNavigate } from "react-router-dom";
import { chains } from "@anoma/chains";
import { Chain } from "@anoma/types";

import { setFiatCurrency, setChainId, SettingsState } from "slices/settings";
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
} from "@anoma/components";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import { ButtonsContainer, SettingsContent } from "../Settings.components";

export const SettingsWalletSettings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const networks = Object.values(chains).map(({ chainId, alias }: Chain) => ({
    label: alias,
    value: chainId,
  }));

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

  const handleNetworkSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = e.target;

    dispatch(setChainId(value));
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

        <InputContainer>
          <Select
            label={
              <div>
                Network
                <Tooltip
                  anchor={<Icon iconName={IconName.Info} />}
                  tooltipText="Default network from which accounts will be derived."
                />
              </div>
            }
            value={chainId}
            data={networks}
            onChange={handleNetworkSelect}
          />
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
