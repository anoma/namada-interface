import { TopLevelRoute } from "App/types";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { Icon, IconName, IconSize } from "components/Icon";
import { NavigationContainer } from "components/NavigationContainer";
import { Tokens } from "constants/";
import { useParams, useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { DerivedAccount, AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { formatRoute, stringFromTimestamp } from "utils/helpers";
import {
  ButtonsContainer,
  SettingsButton,
  TokenDetailContainer,
  TransactionList,
  TransactionListItem,
} from "./TokenDetails.components";
import { Address } from "./Transfers/TransferDetails.components";

type Props = {
  persistor: Persistor;
};

type TokenDetailsParams = {
  id: string;
};

const TokenDetails = ({ persistor }: Props): JSX.Element => {
  const navigate = useNavigate();
  const { id = "" } = useParams<TokenDetailsParams>();
  const { derived, transactions: accountTransactions } =
    useAppSelector<AccountsState>((state) => state.accounts);

  const account: DerivedAccount = derived[id] || {};
  const { alias, tokenType, balance, establishedAddress } = account;
  const token = Tokens[tokenType] || {};

  // eslint-disable-next-line prefer-const
  let transactions =
    (accountTransactions[id] && [...accountTransactions[id]]) || [];
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
        <Heading level={HeadingLevel.Two}>
          {alias}
          <SettingsButton
            onClick={() => {
              navigate(
                formatRoute(TopLevelRoute.SettingsAccountSettings, { id })
              );
            }}
          >
            <Icon iconSize={IconSize.M} iconName={IconName.Settings} />
          </SettingsButton>
        </Heading>
        <p>
          {token.coin} - {token.symbol}
          <br />
          {balance}
          <br />
          Address:
        </p>

        <Address>{establishedAddress}</Address>
        <ButtonsContainer>
          <Button
            variant={ButtonVariant.Small}
            style={{ width: 180 }}
            onClick={() => {
              navigate(formatRoute(TopLevelRoute.TokenReceive, { id }));
            }}
          >
            Receive
          </Button>
          <Button
            variant={ButtonVariant.Small}
            style={{ width: 180 }}
            onClick={() => {
              navigate(formatRoute(TopLevelRoute.TokenSend, { id }));
            }}
          >
            Send
          </Button>
        </ButtonsContainer>

        <Heading level={HeadingLevel.Three}>Transactions</Heading>
        {transactions.length === 0 && <p>No transactions</p>}
        {transactions.length > 0 && (
          <TransactionList>
            {transactions.map((transaction) => {
              const { appliedHash, amount, timestamp } = transaction;
              const dateTimeFormatted = stringFromTimestamp(timestamp);

              return (
                <TransactionListItem key={`${appliedHash}:${timestamp}`}>
                  <div>
                    <strong>{amount}</strong>
                    <br />
                    {dateTimeFormatted}
                  </div>
                  <Button
                    variant={ButtonVariant.Small}
                    onClick={() => {
                      navigate(
                        formatRoute(TopLevelRoute.TokenTransferDetails, {
                          id,
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
