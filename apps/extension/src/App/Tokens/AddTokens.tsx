import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
} from "@namada/components";
import { Address } from "@namada/shared";
//TODO: extract
import {
  AddAccountContainer,
  InputContainer,
} from "App/Accounts/AddAccount.components";
import { useCallback, useEffect, useState } from "react";
import {
  Token,
  TokenAddress,
  TokenSymbol,
  TokensContainer,
  TokensList,
} from "./Tokens.components";
import { shortenAddress } from "@namada/utils";
import { TopLevelRoute } from "App/types";
import { useNavigate } from "react-router-dom";

export const AddTokens: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenBech32mAddress, setTokenBech32mAddress] = useState("");
  const [nutBech32mAddress, setNutBech32mAddress] = useState("");
  const addressValid = tokenBech32mAddress !== "" && nutBech32mAddress !== "";

  useEffect(() => {
    if (tokenAddress !== "") {
      verify(tokenAddress);
    }
  }, [tokenAddress]);

  const navigate = useNavigate();

  const verify = useCallback(
    (() => {
      let interval: NodeJS.Timeout | null;

      return (tokenAddress: string) => {
        interval && clearTimeout(interval);
        interval = setTimeout(() => {
          interval = null;
          try {
            const [token, nut] = Address.from_erc20(tokenAddress);
            setTokenBech32mAddress(token);
            setNutBech32mAddress(nut);
          } catch (error) {
            setTokenBech32mAddress("");
            setNutBech32mAddress("");
          }
        }, 300);
      };
    })(),
    []
  );

  return (
    <AddAccountContainer>
      <InputContainer>
        <Input
          variant={InputVariants.Text}
          label="ERC20 Token Address"
          autoFocus={true}
          value={tokenAddress}
          onChangeCallback={(e) => {
            const { value } = e.target;
            setTokenAddress(value);
          }}
        />
      </InputContainer>

      {addressValid && (
        <>
          <TokensContainer>
            <TokensList>
              <Token>
                <TokenSymbol>Namada Token Address</TokenSymbol>
                <TokenAddress>
                  {shortenAddress(tokenBech32mAddress, 32, 4)}
                </TokenAddress>
              </Token>
              <Token>
                <TokenSymbol>Namada NUT Address</TokenSymbol>
                <TokenAddress>
                  {shortenAddress(nutBech32mAddress, 32, 4)}
                </TokenAddress>
              </Token>
            </TokensList>
          </TokensContainer>

          <Button
            variant={ButtonVariant.ContainedAlternative}
            onClick={() => navigate(TopLevelRoute.Tokens)}
          >
            Add
          </Button>
        </>
      )}
    </AddAccountContainer>
  );
};
