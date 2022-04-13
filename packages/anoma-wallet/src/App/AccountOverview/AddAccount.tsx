import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Symbols, TokenType, Tokens } from "constants/";
import { Wallet, Session } from "lib";
import {
  DerivedAccount,
  AccountsState,
  submitInitAccountTransaction,
} from "slices/accounts";
import { useAppDispatch, useAppSelector } from "store";

import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import {
  AccountOverviewContainer,
  InputContainer,
} from "./AccountOverview.components";
import { Button, ButtonVariant } from "components/Button";
import { TopLevelRoute } from "App/types";
import { Select, Option } from "components/Select";
import { Input, InputVariants } from "components/Input";

const MIN_ALIAS_LENGTH = 2;

export const AddAccount = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { derived, isAccountInitializing, accountInitializationError } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const [alias, setAlias] = useState<string>("");
  const [aliasError, setAliasError] = useState<string>();
  const [tokenType, setTokenType] = useState<TokenType>("NAM");

  const tokensData: Option<string>[] = Symbols.map((symbol: TokenType) => {
    const token = Tokens[symbol];

    return {
      label: `${token.coin} - ${token.symbol}`,
      value: symbol,
    };
  });

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setAlias(value);
  };

  const handleTokenSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setTokenType(value as TokenType);
  };

  const getAccountIndex = (
    accounts: DerivedAccount[],
    tokenType: string
  ): number =>
    accounts.filter(
      (account: DerivedAccount) => account.tokenType === tokenType
    ).length;

  const aliasExists = (alias: string): boolean =>
    Object.values(derived).some((account) => account.alias === alias);

  const validateAlias = (alias: string): boolean =>
    alias.length > MIN_ALIAS_LENGTH &&
    !aliasExists(alias) &&
    !!alias.match(/^[a-z0-9\-\s]+$/i);

  useEffect(() => {
    // Ignore length validation for error messages as it's rather obvious
    if (alias.length > MIN_ALIAS_LENGTH && !validateAlias(alias)) {
      if (aliasExists(alias)) {
        setAliasError("Alias already exists. Please choose a different alias.");
      } else {
        setAliasError("Invalid characters in alias");
      }
    } else {
      setAliasError(undefined);
    }
  }, [alias]);

  const handleAddClick = async (): Promise<void> => {
    const trimmedAlias = alias.trim();

    if (!trimmedAlias || !validateAlias(trimmedAlias)) {
      return setAliasError("Invalid alias. Choose a different account alias.");
    }

    const mnemonic = await new Session().getSeed();

    if (mnemonic && trimmedAlias) {
      setAliasError(undefined);

      const wallet = await new Wallet(mnemonic, tokenType).init();
      const index = getAccountIndex(
        Object.keys(derived).map((key: string) => derived[key]),
        tokenType
      );

      const account = wallet.new(index);
      const { public: publicKey, secret: privateKey, wif: address } = account;

      dispatch(
        submitInitAccountTransaction({
          alias: trimmedAlias,
          tokenType,
          address,
          publicKey,
          signingKey: privateKey,
        })
      );
    }
  };

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
        <Input
          variant={InputVariants.Text}
          label="Account Alias"
          value={alias}
          onChangeCallback={handleAliasChange}
          error={aliasError}
        />
      </InputContainer>

      <InputContainer>
        <Select
          data={tokensData}
          label={"Select Token"}
          value={tokenType}
          onChange={handleTokenSelect}
        ></Select>
      </InputContainer>
      {isAccountInitializing && <p>Initializing Account</p>}
      {accountInitializationError && <p>{accountInitializationError}</p>}
      <Button
        variant={ButtonVariant.Contained}
        onClick={handleAddClick}
        disabled={!validateAlias(alias) || isAccountInitializing}
      >
        Add
      </Button>
    </AccountOverviewContainer>
  );
};
