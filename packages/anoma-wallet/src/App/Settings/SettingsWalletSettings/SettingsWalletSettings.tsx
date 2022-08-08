import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chain } from "config/chain";
import { setFiatCurrency, setChainId, SettingsState } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";
import { Keplr, Session } from "lib";
import { Currencies } from "constants/";

import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import {
  ExtensionInfo,
  SettingsWalletSettingsContainer,
} from "./SettingsWalletSettings.components";
import { Tooltip } from "components/Tooltip";
import { Icon, IconName } from "components/Icon";
import { Select, Option } from "components/Select";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";
import { Button, ButtonVariant } from "components/Button";
import {
  SeedPhraseCard,
  SeedPhraseContainer,
  SeedPhraseIndexLabel,
} from "App/AccountCreation/Steps/SeedPhrase/SeedPhrase.components";
import Config from "config";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import { TopLevelRoute } from "App/types";
import { ButtonsContainer, SettingsContent } from "../Settings.components";

type Props = {
  password: string;
};

export const SettingsWalletSettings = ({ password }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const chains = Object.values(Config.chain);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const chain = Config.chain[chainId];

  const keplr = useMemo(() => {
    return new Keplr(chain);
  }, [chainId]);

  const [displaySeedPhrase, setDisplaySeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);
  const [isKeplrAddingChain, setIsKeplrAddingChain] = useState(false);
  const [isKeplrChainAdded, setIsKeplrChainAdded] = useState(false);
  const [isKeplrConnecting, setIsKeplrConnecting] = useState(false);
  const [isKeplrConnected, setIsKeplrConnected] = useState(false);

  const networks = Object.values(chains).map(({ id, alias }: Chain) => ({
    label: alias,
    value: id,
  }));

  const handleDisplaySeedPhrase = async (): Promise<void> => {
    if (!displaySeedPhrase) {
      setIsLoadingSeed(true);
      const mnemonic = await Session.getSeed(password);
      setIsLoadingSeed(false);
      setSeedPhrase((mnemonic || "").split(" "));
      setDisplaySeedPhrase(!displaySeedPhrase);
    } else {
      setDisplaySeedPhrase(!displaySeedPhrase);
    }
  };

  const currencies: Option<string>[] = Currencies.map((currency) => ({
    value: currency.currency,
    label: `${currency.currency} - ${currency.label}`,
  }));

  const currentCurrency = useAppSelector(
    (state) => state.settings.fiatCurrency
  );

  useEffect(() => {
    (async () => {
      try {
        const isChainAdded = await keplr.detectChain();
        if (isChainAdded) {
          setIsKeplrChainAdded(true);
        } else {
          setIsKeplrChainAdded(false);
          setIsKeplrConnected(false);
        }
      } catch (e) {
        console.warn(e);
        setIsKeplrChainAdded(false);
        setIsKeplrConnected(false);
      }
    })();
  }, [chainId]);

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

  const handleKeplrSuggestChainClick = async (): Promise<void> => {
    if (keplr.detect()) {
      try {
        setIsKeplrAddingChain(true);
        await keplr.suggestChain();
        setIsKeplrChainAdded(true);
      } catch (e) {
        console.warn(e);
        setIsKeplrChainAdded(false);
      } finally {
        setIsKeplrAddingChain(false);
      }
    }
  };

  const handleKeplrEnableClick = async (): Promise<void> => {
    if (keplr.detect()) {
      try {
        setIsKeplrConnecting(true);
        await keplr.enable();
        const key = await keplr.getKey();

        if (key) {
          setIsKeplrConnected(true);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsKeplrConnecting(false);
      }
    }
  };

  return (
    <SettingsWalletSettingsContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Wallet Settings</Heading>
      </NavigationContainer>

      <SettingsContent>
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
                    <SeedPhraseIndexLabel>{`${
                      index + 1
                    }`}</SeedPhraseIndexLabel>
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
            value={chainId}
            data={networks}
            onChange={handleNetworkSelect}
          />
        </InputContainer>

        {keplr.detect() && !isKeplrChainAdded && (
          <Button
            onClick={handleKeplrSuggestChainClick}
            variant={ButtonVariant.Outlined}
            style={{ width: "100%" }}
            disabled={isKeplrAddingChain}
          >
            Add Chain to Keplr
          </Button>
        )}

        {isKeplrChainAdded && !isKeplrConnected && (
          <Button
            onClick={handleKeplrEnableClick}
            variant={ButtonVariant.Outlined}
            style={{ width: "100%" }}
            disabled={isKeplrConnecting}
          >
            Connect to Keplr
          </Button>
        )}

        {isKeplrConnected && (
          <ExtensionInfo>Connected to Keplr Extension</ExtensionInfo>
        )}

        {!keplr.detect() && (
          <ExtensionInfo>
            Install the Keplr extension to connect your Wallet
          </ExtensionInfo>
        )}
      </SettingsContent>
      <ButtonsContainer>
        <BackButton
          onClick={() => {
            navigate(TopLevelRoute.Settings);
          }}
        >
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </SettingsWalletSettingsContainer>
  );
};
