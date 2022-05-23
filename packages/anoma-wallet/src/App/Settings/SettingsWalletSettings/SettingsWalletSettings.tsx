import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsWalletSettingsContainer } from "./SettingsWalletSettings.components";
import { Tooltip } from "components/Tooltip";
import { Icon, IconName } from "components/Icon";
import { Select, Option } from "components/Select";
import { setFiatCurrency, setNetwork } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";
import { Button, ButtonVariant } from "components/Button";
import { Session } from "lib";
import { useState } from "react";

import {
  SeedPhraseCard,
  SeedPhraseContainer,
  SeedPhraseIndexLabel,
} from "App/AccountCreation/Steps/SeedPhrase/SeedPhrase.components";

export const SettingsWalletSettings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [displaySeedPhrase, setDisplaySeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);

  const handleDisplaySeedPhrase = async (): Promise<void> => {
    if (!displaySeedPhrase) {
      setIsLoadingSeed(true);
      const mnemonic = await new Session().getSeed();
      setIsLoadingSeed(false);
      setSeedPhrase((mnemonic || "").split(" "));
      setDisplaySeedPhrase(!displaySeedPhrase);
    } else {
      setDisplaySeedPhrase(!displaySeedPhrase);
    }
  };

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

  /* TODO: Load available Anoma-based networks from config, i.e., Namada */
  const networks: Option<string>[] = [
    {
      label: "Namada",
      value: "Namada",
    },
  ];

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

    dispatch(setNetwork(value));
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

      <InputContainer>
        <Button
          variant={ButtonVariant.Contained}
          style={{ margin: "0" }}
          onClick={handleDisplaySeedPhrase}
          disabled={isLoadingSeed}
        >
          {displaySeedPhrase ? "Hide" : "Display"} seed phrase
        </Button>
        {isLoadingSeed && <p>Decrypting Seed Phrase</p>}
        {displaySeedPhrase && (
          <SeedPhraseContainer>
            {seedPhrase.map((seedPhraseWord, index) => {
              return (
                <SeedPhraseCard key={seedPhraseWord}>
                  <SeedPhraseIndexLabel>{`${index + 1}`}</SeedPhraseIndexLabel>
                  {`${seedPhraseWord}`}
                </SeedPhraseCard>
              );
            })}
          </SeedPhraseContainer>
        )}
      </InputContainer>
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
          value="default"
          data={networks}
          onChange={handleNetworkSelect}
        />
      </InputContainer>
    </SettingsWalletSettingsContainer>
  );
};
