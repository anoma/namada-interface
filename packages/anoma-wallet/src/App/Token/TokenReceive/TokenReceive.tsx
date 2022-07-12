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
} from "./TokenReceive.components";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Select } from "components/Select";

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
  const accountsData = Object.values(accounts).map((account) => ({
    value: account.id,
    label: `${account.alias} (${account.tokenType})`,
  }));

  useEffect(() => {
    if (!selectedAccountId && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [accountsData, selectedAccountId]);

  const {
    establishedAddress = "",
    shieldedKeysAndPaymentAddress,
    alias,
    tokenType,
  } = accounts[selectedAccountId || ""] || {};

  const { protocol, host } = window.location;

  const text = `${protocol}//${host}${formatRoute(
    TopLevelRoute.TokenSendTarget,
    {
      accountIndex,
      tokenType,
      target:
        establishedAddress ||
        shieldedKeysAndPaymentAddress?.paymentAddress ||
        "",
    }
  )}`;

  return (
    <TokenReceiveContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Receive</Heading>
      </NavigationContainer>
      <Heading level={HeadingLevel.Two}>{alias}</Heading>
      <Heading level={HeadingLevel.Three}>{tokenType}</Heading>
      {accountsData.length > 0 && (
        <Select
          data={accountsData || []}
          value={selectedAccountId}
          label="Select an account to transfer from:"
          onChange={(e) => setSelectedAccountId(e.target.value)}
        />
      )}
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
      <Address>{establishedAddress}</Address>
    </TokenReceiveContainer>
  );
};

export default TokenReceive;
