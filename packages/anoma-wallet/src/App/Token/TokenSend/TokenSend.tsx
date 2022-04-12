import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { TopLevelRoute } from "App/types";
import { TokenType } from "constants/";

import TokenSendForm from "./TokenSendForm";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Select, Option } from "components/Select";
import { TokenSendContainer } from "./TokenSend.components";

type TokenSendParams = {
  id: string;
  target: string;
  tokenType: TokenType;
};

const TokenSend = (): JSX.Element => {
  const navigate = useNavigate();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { id, target, tokenType } = useParams<TokenSendParams>();

  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(id);
  const [accountsData, setAccounts] = useState<Option<string>[]>();

  // Collect any accounts matching tokenType
  const accounts = tokenType
    ? Object.keys(derived)
        .map((hash: string) => ({
          id: hash,
          alias: derived[hash].alias,
          tokenType: derived[hash].tokenType,
        }))
        .filter((account) => account.tokenType === tokenType)
    : [];

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
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
            return navigate(-1);
          }
          navigate(TopLevelRoute.Wallet);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Send</Heading>
      </NavigationContainer>
      {target &&
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
