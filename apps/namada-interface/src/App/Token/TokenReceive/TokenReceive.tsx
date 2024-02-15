import { chains } from "@namada/chains";
import { Heading, Icon, NavigationContainer, Select } from "@namada/components";
import { formatRoute } from "@namada/utils";
import { TopLevelRoute } from "App/types";
import { useQRCode } from "next-qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { BackButton } from "../TokenSend/TokenSendForm.components";
import {
  Address,
  ButtonsContainer,
  CanvasContainer,
  TokenReceiveContainer,
  TokenReceiveContent,
} from "./TokenReceive.components";

const TokenReceive = (): JSX.Element => {
  const { Canvas } = useQRCode();
  const navigate = useNavigate();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const [selectedAccountAddress, setSelectedAccountAddress] = useState<
    string | undefined
  >();

  const accounts = Object.values(derived[chains.namada.id]);

  const accountsData = accounts.map(({ details }) => ({
    value: details.address,
    label: `${details.alias} - ${details.isShielded ? "Shielded" : "Transparent"
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
  }, []);

  const { protocol, host } = window.location;

  const text = `${protocol}//${host}${formatRoute(
    TopLevelRoute.TokenSendTarget,
    {
      // TODO: Fix this:
      target: selectedAccountAddress || "",
    }
  )}`;

  return (
    <TokenReceiveContainer>
      <NavigationContainer>
        <Heading level="h1">Receive</Heading>
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
          <Icon name="ChevronLeft" />
        </BackButton>
      </ButtonsContainer>
    </TokenReceiveContainer>
  );
};

export default TokenReceive;
