import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Symbols, TokenType, Tokens } from "constants/";
import { Wallet, Session } from "lib";
import { useAppDispatch, useAppSelector } from "store";

import { DerivedAccount, AccountsState, addAccount } from "slices/accounts";
import { SettingsState } from "slices/settings";

import { NewAccountDetails } from "slices/accountsNew";
import { createShieldedAccount, reset } from "slices/accountsNew/actions";

import { Label } from "components/Input/input.components";
import { Toggle } from "components/Toggle";
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
import Config from "config";

const MIN_ALIAS_LENGTH = 2;

type Props = {
  password: string;
};

export const AddAccount = ({ password }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { derived, isAddingAccountInReduxState } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const [isShielded, setIsShielded] = useState<boolean>(true);
  const [alias, setAlias] = useState<string>("");
  const [aliasError, setAliasError] = useState<string>();
  const [tokenType, setTokenType] = useState<TokenType>("NAM");
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const derivedAccounts = derived[chainId] || {};
  const { accountIndex } = Config.chain[chainId];

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

  const handleShieldedToggling = (): void => {
    setIsShielded((isShielded) => !isShielded);
    dispatch(reset());
  };

  const getAccountIndex = (
    accounts: DerivedAccount[],
    tokenType: string
  ): number =>
    accounts.filter(
      (account: DerivedAccount) => account.tokenType === tokenType
    ).length;

  const aliasExists = (alias: string): boolean =>
    Object.values(derivedAccounts).some((account) => account.alias === alias);

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

  // triggers the creation of new account on the ledger. Does both
  // transparent and shielded
  const handleAddShieldedAccount = (): void => {
    const newAccountDetails: NewAccountDetails = {
      alias: alias.trim(),
      tokenType: tokenType,
    };
    if (newAccountDetails) {
      dispatch(
        createShieldedAccount({ chainId, ...newAccountDetails, password })
      );
    }
  };

  const handleAddClick = async (): Promise<void> => {
    // TODO refactor these all together, this is just for now to
    // develop adding the shielded accounts separately
    if (isShielded) {
      handleAddShieldedAccount();
      return;
    }

    const trimmedAlias = alias.trim();

    if (!trimmedAlias || !validateAlias(trimmedAlias)) {
      return setAliasError("Invalid alias. Choose a different account alias.");
    }
    setIsAddingAccount(true);
    const mnemonic = await Session.getSeed(password);

    if (mnemonic && trimmedAlias) {
      setAliasError(undefined);

      const wallet = await new Wallet(mnemonic, tokenType).init();
      const index = getAccountIndex(
        Object.keys(derivedAccounts).map((key: string) => derivedAccounts[key]),
        tokenType
      );

      const account = wallet.new(accountIndex, index);
      const { public: publicKey, secret: signingKey, wif: address } = account;

      dispatch(
        addAccount({
          chainId,
          alias: trimmedAlias,
          tokenType,
          address,
          publicKey,
          signingKey,
        })
      );
      navigate(TopLevelRoute.Wallet);
    } else {
      console.error("Could not find mnemonic!");
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
        <Label>Shielded</Label>
        <Toggle onClick={handleShieldedToggling} checked={isShielded} />
      </InputContainer>
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

      {(isAddingAccountInReduxState || isAddingAccount) && (
        <p>Adding new account...</p>
      )}
      <Button
        variant={ButtonVariant.Contained}
        onClick={handleAddClick}
        disabled={
          !validateAlias(alias) ||
          isAddingAccountInReduxState ||
          isAddingAccount
        }
      >
        Add
      </Button>
    </AccountOverviewContainer>
  );
};
