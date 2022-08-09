import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { TopLevelRoute } from "App/types";
import {
  DerivedAccount,
  ShieldedKeysAndPaymentAddress,
  AccountsState,
  fetchBalanceByAccount,
} from "slices/accounts";
import { TransfersState } from "slices/transfers";
import { SettingsState } from "slices/settings";
import { updateShieldedBalances } from "slices/AccountsNew_noCaching";
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
  AccountsDetailsNavContainer,
} from "./TokenDetails.components";
import { Address } from "./Transfers/TransferDetails.components";

type Props = {
  persistor: Persistor;
};

type TokenDetailsParams = {
  id: string;
};

// renders the grey box containing the account details
// just for shielded accoutns for now as the one for transparent is
// constructed in return statement
// TODO refactor the transparent to this
const getAccountDetails = (
  shielded: ShieldedKeysAndPaymentAddress | undefined
): JSX.Element => {
  if (shielded === undefined) {
    return <></>;
  }
  return (
    <>
      <h4>Viewing Key</h4>
      <Address>
        {shielded.viewingKey} <br />
      </Address>
      <h4>Payment Address</h4>
      <Address>{shielded.paymentAddress}</Address>
    </>
  );
};

const TokenDetails = ({ persistor }: Props): JSX.Element => {
  const navigate = useNavigate();
  const { id = "" } = useParams<TokenDetailsParams>();
  const { derived, shieldedAccounts: shieldedAccountsByChainId } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const chainConfig = useAppSelector<ChainsState>((state) => state.chains);
  const { ibc } = chainConfig[chainId];
  const { transactions: accountTransactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );
  const dispatch = useAppDispatch();

  const derivedAccounts = derived[chainId] || {};
  const shieldedAccounts = shieldedAccountsByChainId[chainId] || {};
  const accounts = { ...derivedAccounts, ...shieldedAccounts };

  const account: DerivedAccount = accounts[id] || {};
  const {
    alias,
    tokenType,
    balance,
    establishedAddress,
    isInitializing,
    isShielded,
  } = account;

  let shieldedKeysAndPaymentAddress: ShieldedKeysAndPaymentAddress | undefined;

  if (shieldedAccounts && shieldedAccounts[id]) {
    shieldedKeysAndPaymentAddress =
      shieldedAccounts[id].shieldedKeysAndPaymentAddress;
  }

  const renderedShieldedAccountDetails = getAccountDetails(
    shieldedKeysAndPaymentAddress
  );

  const token = Tokens[tokenType] || {};

  // eslint-disable-next-line prefer-const
  const transactions = accountTransactions
    .filter(
      (transaction) =>
        (transaction.source === establishedAddress ||
          transaction.target === establishedAddress) &&
        transaction.chainId === chainId
    )
    .reverse();

  useEffect(() => {
    dispatch(fetchBalanceByAccount(account));

    // TODO, is this really needed here, we have updated the balance at
    // the completion of new transfer and when rendering accounts overview
    dispatch(updateShieldedBalances());
  }, []);

  return (
    <TokenDetailContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <AccountsDetailsNavContainer>
          <Heading level={HeadingLevel.One}>{alias}</Heading>
          <SettingsButton
            onClick={() => {
              navigate(
                formatRoute(TopLevelRoute.SettingsAccountSettings, { id })
              );
            }}
            disabled={!!shieldedKeysAndPaymentAddress}
            title={
              !!shieldedKeysAndPaymentAddress
                ? "Account settings for shielded accounts are not implemented yet"
                : ""
            }
          >
            <Icon iconSize={IconSize.M} iconName={IconName.Settings} />
          </SettingsButton>
        </AccountsDetailsNavContainer>
      </NavigationContainer>
      <PersistGate loading={"Loading token details..."} persistor={persistor}>
        <p>
          <strong>
            {balance} {token.symbol}
          </strong>
        </p>

        {/* renders the address if this is a transparent account */}
        {!!!isShielded && (
          <>
            {isInitializing ? (
              <p>Account is initializing...</p>
            ) : (
              <Address>{establishedAddress}</Address>
            )}
          </>
        )}

        {/* renders the account detail if this is a shielded account */}
        {renderedShieldedAccountDetails}

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
        {ibc && Object.values(ibc).length > 0 && (
          <ButtonsContainer>
            <Button
              variant={ButtonVariant.Small}
              style={{ width: "100%" }}
              onClick={() => {
                navigate(formatRoute(TopLevelRoute.TokenIbcTransfer, { id }));
              }}
            >
              IBC Transfer
            </Button>
          </ButtonsContainer>
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
