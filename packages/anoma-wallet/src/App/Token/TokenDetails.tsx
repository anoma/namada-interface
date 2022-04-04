import { TopLevelRoute } from "App/types";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Tokens } from "constants/";
import { useParams, useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { DerivedAccount, DerivedAccountsState } from "slices/accounts";
import { BalancesState } from "slices/balances";
import { TransactionsState } from "slices/transactions";
import { useAppSelector } from "store";
import { formatRoute, stringToHash } from "utils/helpers";
import {
  ButtonsContainer,
  TokenDetailContainer,
} from "./TokenDetails.components";

type Props = {
  persistor: Persistor;
};

type TokenDetailsParams = {
  hash: string;
};

const TokenDetails = ({ persistor }: Props): JSX.Element => {
  const navigate = useNavigate();
  const { hash = "" } = useParams<TokenDetailsParams>();
  const { derived } = useAppSelector<DerivedAccountsState>(
    (state) => state.accounts
  );
  const { accountBalances } = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const { accountTransactions } = useAppSelector<TransactionsState>(
    (state) => state.transactions
  );

  const account: DerivedAccount = derived[hash] || {};
  const { alias, tokenType } = account;
  const { token: tokenBalance } = accountBalances[stringToHash(alias)];
  const token = Tokens[tokenType];
  const transactions = accountTransactions[hash] || [];

  return (
    <TokenDetailContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Token Details</Heading>
      </NavigationContainer>
      <PersistGate loading={"Loading token details..."} persistor={persistor}>
        <Heading level={HeadingLevel.Three}>{alias}</Heading>
        <p>
          Token: {token.coin} - {token.symbol}
        </p>
        <p>Balance: {tokenBalance}</p>

        <ButtonsContainer>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              navigate(formatRoute(TopLevelRoute.TokenSend, { hash }));
            }}
          >
            Send
          </Button>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              navigate(formatRoute(TopLevelRoute.TokenReceive, { hash }));
            }}
          >
            Receive
          </Button>
        </ButtonsContainer>

        <div>
          {/* TRANSACTIONS - TODO */}
          {transactions.map((transaction, i: number) => {
            const { tokenType, amount, target, timestamp } = transaction;
            return (
              <div key={i}>
                {Tokens[tokenType].coin}
                <br />
                {amount}
                <br />
                {target}
                <br />
                {timestamp}
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => {
            navigate(
              formatRoute(TopLevelRoute.SettingsAccountSettings, { hash })
            );
          }}
          variant={ButtonVariant.Contained}
        >
          Settings
        </Button>
      </PersistGate>
    </TokenDetailContainer>
  );
};

export default TokenDetails;
