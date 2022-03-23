import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import {
  AccountOverviewContainer,
  InputContainer,
} from "./AccountOverview.components";
import { useAppSelector } from "store";
import { Button, ButtonVariant } from "components/Button";
import { TopLevelRoute } from "App/types";
import { Select, Option } from "components/Select";
import { Input, InputVariants } from "components/Input";
import { useEffect, useState } from "react";
import { TokenType, Tokens } from "constants/";
import { useAppDispatch } from "store/store";
import { addAccount } from "slices";

export const AddAccount = (): JSX.Element => {
  const { derived } = useAppSelector((state) => state.accounts);
  const navigate = useNavigate();
  const [tokenType, setTokenType] = useState<TokenType>("BTC");
  const dispatch = useAppDispatch();

  const tokensData: Option<string>[] = Object.keys(Tokens).map(
    (type: string) => {
      const token = Tokens[type];

      return {
        label: `${token.coin} - ${token.symbol}`,
        value: type,
      };
    }
  );

  const onTokenSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setTokenType(value as TokenType);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateAlias = (alias: string): boolean => !derived[alias];

  return (
    <AccountOverviewContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>Add Account</Heading>
      </NavigationContainer>
      <InputContainer>
        <Input variant={InputVariants.Text} label="Account Alias" />
      </InputContainer>

      <InputContainer>
        <Select
          data={tokensData}
          onChange={onTokenSelect}
          value={tokenType}
        ></Select>
      </InputContainer>
      <Button variant={ButtonVariant.Contained}>Add</Button>
    </AccountOverviewContainer>
  );
};
