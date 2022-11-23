import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQRCode } from "next-qrcode";

import Config from "config";
import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { formatRoute } from "@anoma/utils";
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
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const [selectedAccountAddress, setSelectedAccountAddress] = useState<
    string | undefined
  >();
  const accounts = derived[chainId] || {};
  const { accountIndex } = Config.chain[chainId] || {};

  const accountsArray = Object.values(accounts);

  const accountsData = Object.values(accountsArray).map((account) => ({
    value: account.address,
    label: `${account.alias} - ${
      account.isShielded ? "Shielded" : "Transparent"
    }`,
  }));

  useEffect(() => {
    if (!selectedAccountAddress && accountsData && accountsData.length > 0) {
      setSelectedAccountAddress(accountsData[0].value);
    }
  }, [accountsData, selectedAccountAddress]);

  useEffect(() => {
    if (accountsData[0]) {
      setSelectedAccountAddress(accountsData[0].value);
    }
  }, [chainId]);

  accounts[selectedAccountAddress || ""] || {};

  const { protocol, host } = window.location;

  const text = `${protocol}//${host}${formatRoute(
    TopLevelRoute.TokenSendTarget,
    {
      accountIndex,
      // TODO: Fix this:
      target: selectedAccountAddress || "",
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
              value={selectedAccountAddress}
              label="Account"
              onChange={(e) => setSelectedAccountAddress(e.target.value)}
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
            <Address>{selectedAccountAddress}</Address>
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
