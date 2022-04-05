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
import { formatRoute, stringFromTimestamp, stringToHash } from "utils/helpers";
import {
  ButtonsContainer,
  TokenDetailContainer,
  TransactionList,
  TransactionListItem,
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
  const { token: tokenBalance } = accountBalances[stringToHash(alias)] || {};
  const token = Tokens[tokenType] || {};

  // eslint-disable-next-line prefer-const
  let transactions =
    (accountTransactions[hash] && [...accountTransactions[hash]]) || [];
  transactions.sort((a, b) => b.timestamp - a.timestamp);

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

        <Heading level={HeadingLevel.Three}>Transactions</Heading>
        {transactions.length === 0 && <p>No transactions</p>}
        {transactions.length > 0 && (
          <TransactionList>
            {transactions.map((transaction, i) => {
              const { appliedHash, tokenType, amount, timestamp } = transaction;
              const dateTimeFormatted = stringFromTimestamp(timestamp);

              return (
                <TransactionListItem key={i}>
                  <div>
                    {Tokens[tokenType].symbol} - <strong>{amount}</strong>
                    <br />
                    {dateTimeFormatted}
                  </div>
                  <Button
                    variant={ButtonVariant.Small}
                    onClick={() => {
                      navigate(
                        formatRoute(TopLevelRoute.TokenTransferDetails, {
                          hash,
                          appliedHash,
                        })
                      );
                    }}
                  >
                    Details
                  </Button>
                </TransactionListItem>
              );
            })}
          </TransactionList>
        )}
      </PersistGate>
    </TokenDetailContainer>
  );
};

export default TokenDetails;
