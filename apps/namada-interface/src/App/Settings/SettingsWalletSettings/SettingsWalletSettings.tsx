import { useNavigate } from "react-router-dom";
import { Chain } from "config/chain";
import { setFiatCurrency, setChainId, SettingsState } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";
import { Currencies } from "currencies";

import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsWalletSettingsContainer } from "./SettingsWalletSettings.components";
import { Tooltip } from "components/Tooltip";
import { Icon, IconName } from "components/Icon";
import { Select, Option } from "components/Select";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";
import Config from "config";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import { TopLevelRoute } from "App/types";
import { ButtonsContainer, SettingsContent } from "../Settings.components";

export const SettingsWalletSettings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const chains = Object.values(Config.chain);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const networks = Object.values(chains).map(({ id, alias }: Chain) => ({
    label: alias,
    value: id,
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
