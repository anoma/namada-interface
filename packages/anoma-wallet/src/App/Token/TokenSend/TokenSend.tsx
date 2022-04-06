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
  hash: string;
  target: string;
  tokenType: TokenType;
};

const TokenSend = (): JSX.Element => {
  const navigate = useNavigate();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { hash: defaultHash, target, tokenType } = useParams<TokenSendParams>();
  const [hash, setHash] = useState<string | undefined>(defaultHash);
  const [accountsData, setAccounts] = useState<Option<string>[]>();

  // Collect any accounts matching tokenType
  const accounts = tokenType
    ? Object.keys(derived)
        .map((hash: string) => ({
          hash,
          alias: derived[hash].alias,
          tokenType: derived[hash].tokenType,
        }))
        .filter((account) => account.tokenType === tokenType)
    : [];

  useEffect(() => {
    if (!hash && accounts.length > 0) {
      const accountsData = accounts.map((account) => ({
        value: account.hash,
        label: `${account.alias} (${account.tokenType})`,
      }));

      setHash(accounts[0].hash);
      setAccounts(accountsData);
    }
  }, [accounts]);

  return (
    <TokenSendContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Send</Heading>
      </NavigationContainer>
      {target &&
        (accounts.length > 0 ? (
          <Select
            data={accountsData || []}
            value={hash}
            label="Select an account to transfer from"
            onChange={(e) => setHash(e.target.value)}
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
      {hash && <TokenSendForm hash={hash} target={target} />}
    </TokenSendContainer>
  );
};

export default TokenSend;
