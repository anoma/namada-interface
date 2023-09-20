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

const tokens = Object.values(SupportedTokens);

export const Tokens: React.FC = () => {
  const navigate = useNavigate();

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
        Add Token
      </Button>
    </AddAccountContainer>
  );
};
