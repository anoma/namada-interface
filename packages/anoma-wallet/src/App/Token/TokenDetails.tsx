import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { TopLevelRoute } from "App/types";
import {
  DerivedAccount,
  AccountsState,
  fetchBalanceByAccount,
} from "slices/accounts";
import { TransfersState } from "slices/transfers";
import { SettingsState } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";
import { formatRoute, stringFromTimestamp } from "utils/helpers";
import { ChainsState } from "slices/chains";

import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { Icon, IconName, IconSize } from "components/Icon";
import { NavigationContainer } from "components/NavigationContainer";
import { Tokens } from "constants/";
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
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const chainConfig = useAppSelector<ChainsState>((state) => state.chains);
  const { ibc } = chainConfig[chainId];

  const { transactions: accountTransactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );
  const dispatch = useAppDispatch();

  const derivedAccounts = derived[chainId] || {};
  const account: DerivedAccount = derivedAccounts[id] || {};

  const { alias, tokenType, balance, establishedAddress, isInitializing } =
    account;
  const token = Tokens[tokenType] || {};

  // eslint-disable-next-line prefer-const
  const transactions = accountTransactions
    .filter(
      (transaction) =>
        transaction.source === establishedAddress ||
        transaction.target === establishedAddress
    )
    .reverse();

  useEffect(() => {
    if (establishedAddress) {
      dispatch(fetchBalanceByAccount(account));
    }
  }, []);

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
          <div style={{ display: "flex", alignItems: "center" }}>
            <SettingsButton
              onClick={() => {
                navigate(
                  formatRoute(TopLevelRoute.SettingsAccountSettings, { id })
                );
              }}
            >
              <Icon iconSize={IconSize.M} iconName={IconName.Settings} />
            </SettingsButton>
            {alias}
          </div>
        </Heading>
        <p>
          <strong>
            {balance} {token.symbol}
          </strong>
        </p>

        {isInitializing ? (
          <p>Account is initializing...</p>
        ) : (
          <>
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
            {/* TODO: Only display if this is a valid token account from which to submit an IBC Transfer */}
            {ibc && Object.values(ibc).length > 0 && (
              <ButtonsContainer>
                <Button
                  variant={ButtonVariant.Small}
                  style={{ width: "100%" }}
                  onClick={() => {
                    navigate(
                      formatRoute(TopLevelRoute.TokenIbcTransfer, { id })
                    );
                  }}
                >
                  IBC Transfer
                </Button>
              </ButtonsContainer>
            )}
          </>
        )}

        <Heading level={HeadingLevel.Three}>Transactions</Heading>
        {transactions.length === 0 && <p>No transactions</p>}
        {transactions.length > 0 && (
          <TransactionList>
            {transactions.map((transaction) => {
              const { appliedHash, amount, timestamp, type } = transaction;
              const dateTimeFormatted = stringFromTimestamp(timestamp);

              return (
                <TransactionListItem key={`${appliedHash}:${timestamp}`}>
                  <div>
                    <strong>
                      {transaction.source === establishedAddress
                        ? "Sent "
                        : "Received "}
                      ({type}) {amount} {tokenType}
                    </strong>
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
