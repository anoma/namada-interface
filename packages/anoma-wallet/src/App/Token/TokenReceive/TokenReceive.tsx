import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQRCode } from "next-qrcode";

import Config from "config";
import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { formatRoute } from "utils/helpers";
import { TopLevelRoute } from "App/types";

import { Address } from "../Transfers/TransferDetails.components";
import {
  CanvasContainer,
  TokenReceiveContainer,
  ButtonsContainer,
  TokenReceiveContent,
} from "./TokenReceive.components";

import { Select } from "components/Select";
import { BackButton } from "../TokenSend/TokenSendForm.components";
import { Icon, IconName } from "components/Icon";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";

const TokenReceive = (): JSX.Element => {
  const { Canvas } = useQRCode();
  const navigate = useNavigate();
  const { derived, shieldedAccounts: allShieldedAccounts } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >();
  const derivedAccounts = derived[chainId] || {};
  const shieldedAccounts = allShieldedAccounts[chainId] || {};

  const { accountIndex } = Config.chain[chainId];

  const accounts = { ...derivedAccounts, ...shieldedAccounts };
  const accountsArray = Object.values(accounts);
  accountsArray.sort((a) => (a.isShielded ? 0 : 1));
  const accountsData = Object.values(accountsArray).map((account) => ({
    value: account.id,
    label: `${account.alias} - ${
      account.isShielded ? "Shielded" : "Transparent"
    }`,
  }));

  useEffect(() => {
    if (!selectedAccountId && accountsData && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [accountsData, selectedAccountId]);

  useEffect(() => {
    if (accountsData[0]) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [chainId]);

  const {
    establishedAddress = "",
    shieldedKeysAndPaymentAddress,
    tokenType,
  } = accounts[selectedAccountId || ""] || {};

  const { protocol, host } = window.location;
  const address =
    establishedAddress || shieldedKeysAndPaymentAddress?.paymentAddress || "";

  const text = `${protocol}//${host}${formatRoute(
    TopLevelRoute.TokenSendTarget,
    {
      accountIndex,
      tokenType,
      target: address,
    }
  )}`;

  return (
    <TokenReceiveContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Receive</Heading>
      </NavigationContainer>

      <TokenReceiveContent>
        {accountsData.length > 0 && (
          <>
            <Select
              data={accountsData || []}
              value={selectedAccountId}
              label="Account:"
              onChange={(e) => setSelectedAccountId(e.target.value)}
            />
            <CanvasContainer>
              <Canvas
                text={text}
                options={{
                  type: "image/jpeg",
                  quality: 0.3,
                  level: "M",
                  color: {
                    dark: "#222",
                    light: "#eee",
                  },
                }}
              />
            </CanvasContainer>
            <Address>{address}</Address>
          </>
        )}
      </TokenReceiveContent>
      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </TokenReceiveContainer>
  );
};

export default TokenReceive;
