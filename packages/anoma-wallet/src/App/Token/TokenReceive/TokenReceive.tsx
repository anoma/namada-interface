import { useNavigate, useParams } from "react-router-dom";
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

type TokenReceiveParams = {
  id: string;
};

const TokenReceive = (): JSX.Element => {
  const { Canvas } = useQRCode();
  const navigate = useNavigate();
  const { id = "" } = useParams<TokenReceiveParams>();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const derivedAccounts = derived[chainId] || {};
  const { accountIndex } = Config.chain[chainId];

  const {
    establishedAddress = "",
    alias,
    tokenType,
  } = derivedAccounts[id] || {};
  const { protocol, host } = window.location;

  const text = `${protocol}//${host}${formatRoute(
    TopLevelRoute.TokenSendTarget,
    {
      accountIndex,
      tokenType,
      target: establishedAddress,
    }
  )}`;

  return (
    <TokenReceiveContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(formatRoute(TopLevelRoute.Token, { id }));
        }}
      >
        <Heading level={HeadingLevel.One}>Token Receive</Heading>
      </NavigationContainer>
      <Heading level={HeadingLevel.Two}>{alias}</Heading>
      <Heading level={HeadingLevel.Three}>{tokenType}</Heading>
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
