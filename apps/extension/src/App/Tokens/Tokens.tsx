import { Tokens as SupportedTokens } from "@namada/types";
import {
  Token,
  TokenAddress,
  TokenSymbol,
  TokensContainer,
  TokensList,
} from "./Tokens.components";
import { shortenAddress } from "@namada/utils";
import { Button, ButtonVariant } from "@namada/components";
import { TopLevelRoute } from "App/types";
import { useNavigate } from "react-router-dom";
//TODO: extract
import { AddAccountContainer } from "App/Accounts/AddAccount.components";
import { useEffect, useState } from "react";
import { ExtensionRequester } from "extension";
import { QueryTokensMsg } from "provider";
import { Ports } from "router";

const supportedTokens = Object.values(SupportedTokens).map(
  ({ symbol, address }) => ({
    symbol,
    address: address || "",
  })
);

export enum Status {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

type Props = {
  requester: ExtensionRequester;
};

export const Tokens: React.FC<Props> = ({ requester }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>();
  const [tokens, setTokens] =
    useState<{ symbol: string; address: string }[]>(supportedTokens);

  useEffect(() => {
    setStatus(Status.Pending);
    const fetchTokens = async (): Promise<void> => {
      const fetchedTokens = await requester
        .sendMessage(Ports.Background, new QueryTokensMsg())
        .catch((e) => {
          //TODO:
          // setError(`Requester error: ${e}`);
        });
      if (fetchedTokens) {
        setTokens((tokens) => [
          ...tokens,
          //TOD:rename alias to symbol
          ...fetchedTokens.map(({ alias, address }) => ({
            symbol: alias,
            address,
          })),
        ]);
      }
      setStatus(Status.Completed);
    };
    fetchTokens();
  }, []);

  return (
    <AddAccountContainer>
      <TokensContainer>
        <TokensList>
          {tokens.map(({ symbol, address }, idx) => (
            <Token key={idx}>
              <TokenSymbol>{symbol}</TokenSymbol>
              <TokenAddress>
                {address && shortenAddress(address, 32, 4)}
              </TokenAddress>
            </Token>
          ))}
        </TokensList>
      </TokensContainer>

      <Button
        variant={ButtonVariant.ContainedAlternative}
        onClick={() => navigate(TopLevelRoute.AddTokens)}
      >
        Import Token
      </Button>
    </AddAccountContainer>
  );
};
