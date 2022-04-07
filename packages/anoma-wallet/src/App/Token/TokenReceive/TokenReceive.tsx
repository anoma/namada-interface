import { useNavigate, useParams } from "react-router-dom";
import { useQRCode } from "next-qrcode";

import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { formatRoute } from "utils/helpers";

import { Address } from "../Transfers/TransferDetails.components";
import {
  CanvasContainer,
  TokenReceiveContainer,
} from "./TokenReceive.components";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { TopLevelRoute } from "App/types";

type TokenReceiveParams = {
  id: string;
};

const TokenReceive = (): JSX.Element => {
  const { Canvas } = useQRCode();
  const navigate = useNavigate();
  const { id = "" } = useParams<TokenReceiveParams>();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const { establishedAddress = "", alias, tokenType } = derived[id] || {};
  const { protocol, host } = window.location;

  const text = `${protocol}//${host}${formatRoute(
    TopLevelRoute.TokenSendTarget,
    {
      tokenType,
      target: establishedAddress,
    }
  )}`;

  return (
    <TokenReceiveContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
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
