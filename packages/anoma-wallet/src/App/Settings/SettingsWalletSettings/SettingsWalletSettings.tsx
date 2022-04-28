import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsWalletSettingsContainer } from "./SettingsWalletSettings.components";
import { Tooltip } from "components/Tooltip";
import { Icon, IconName } from "components/Icon";
import { Select, Option } from "components/Select";
import { setFiatCurrency } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";

export const SettingsWalletSettings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const currencies: Option<string>[] = [
    {
      label: "USD - US dollar",
      value: "USD",
    },
    {
      label: "JPY - Japanese yen",
      value: "JPY",
    },
    {
      label: "EUR - Euro",
      value: "EUR",
    },
  ];

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
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Wallet Settings</Heading>
      </NavigationContainer>

      <Select
        data={currencies}
        label={
          <div>
            Fiat Currency{" "}
            <Tooltip
              anchor={<Icon iconName={IconName.Info} />}
              tooltipText="Fiat currency in which balances may be displayed."
            />
          </div>
        }
        value={currentCurrency}
        onChange={handleCurrencySelect}
      ></Select>
    </SettingsWalletSettingsContainer>
  );
};
