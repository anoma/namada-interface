import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Config from "config";
import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransferType } from "slices/transfers";
import { useAppSelector } from "store";
import { TopLevelRoute } from "App/types";
import { TokenType } from "constants/";
import { formatRoute } from "utils/helpers";
import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";

import TokenSendForm from "./TokenSendForm";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Select, Option } from "components/Select";
import { TokenSendContainer } from "./TokenSend.components";

export const parseTarget = (target: string): TransferType | undefined => {
  if (
    target.startsWith(PAYMENT_ADDRESS_PREFIX) &&
    target.length === PAYMENT_ADDRESS_LENGTH
  ) {
    return TransferType.Shielded;
  } else if (
    target.startsWith(ESTABLISHED_ADDRESS_PREFIX) &&
    target.length === ESTABLISHED_ADDRESS_LENGTH
  ) {
    return TransferType.NonShielded;
  }

  // likely we can unify the form errors and return an object describing the error here
  return undefined;
};

type TokenSendParams = {
  id: string;
  target: string;
  tokenType: TokenType;
  accountIndex?: string;
};

const TokenSend = (): JSX.Element => {
  const navigate = useNavigate();
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const {
    id,
    target,
    tokenType,
    accountIndex = "",
  } = useParams<TokenSendParams>();

  const chainConfig = Config.chain[chainId];

  const [isAccountValid, setIsAccountValid] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(id);
  const [accountsData, setAccounts] = useState<Option<string>[]>();
  const derivedAccounts = derived[chainId] || {};

  const transparentAndShieldedAccounts = {
    ...derivedAccounts,
    ...(shieldedAccounts[chainId] || {}),
  };

  // Collect any accounts matching tokenType
  const accounts = tokenType
    ? Object.keys(transparentAndShieldedAccounts)
        .map((hash: string) => ({
          id: hash,
          alias: derivedAccounts[hash].alias,
          tokenType: derivedAccounts[hash].tokenType,
        }))
        .filter((account) => account.tokenType === tokenType)
    : [];

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      if (parseInt(accountIndex) !== chainConfig.accountIndex) {
        setIsAccountValid(false);
        return;
      }

      const accountsData = accounts.map((account) => ({
        value: account.id,
        label: `${account.alias} (${account.tokenType})`,
      }));

      setSelectedAccountId(accounts[0].id);
      setAccounts(accountsData);
    }
  }, [accounts]);
  return (
    <TokenSendContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          if (id) {
            return navigate(formatRoute(TopLevelRoute.Token, { id }));
          }
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Send</Heading>
      </NavigationContainer>
      {!isAccountValid && (
        <p>The scanned address does not exist on this chain!</p>
      )}
      {target &&
        isAccountValid &&
        (accounts.length > 0 ? (
          <Select
            data={accountsData || []}
            value={selectedAccountId}
            label="Select an account to transfer from:"
            onChange={(e) => setSelectedAccountId(e.target.value)}
          />
        ) : (
          <>
            <p>
              You have no accounts associated with <strong>{tokenType}</strong>
              :(
            </p>
            <Button
              variant={ButtonVariant.Small}
              onClick={() => navigate(TopLevelRoute.WalletAddAccount)}
            >
              Create account
            </Button>
          </>
        ))}
      {selectedAccountId && (
        <TokenSendForm accountId={selectedAccountId} defaultTarget={target} />
      )}
    </TokenSendContainer>
  );
};

export default TokenSend;
