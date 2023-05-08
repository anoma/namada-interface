import { useNavigate } from "react-router-dom";

import { chains } from "@anoma/chains";
import { Chain, Tokens } from "@anoma/types";
import { formatRoute, stringFromTimestamp } from "@anoma/utils";
import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  NavigationContainer,
} from "@anoma/components";

import { TopLevelRoute } from "App/types";
import { AccountsState } from "slices/accounts";
import { TransfersState } from "slices/transfers";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import {
  ButtonsContainer,
  TokenDetailContainer,
  TransactionList,
  TransactionListItem,
  AccountsDetailsNavContainer,
} from "./TokenDetails.components";
import { useSanitizedParams } from "../../hooks/useSanitizedParams";

type TokenDetailsParams = {
  id: string;
};

const TokenDetails = (): JSX.Element => {
  const navigate = useNavigate();
  const { id = "" } = useSanitizedParams<TokenDetailsParams>();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { ibc } =
    Object.values(chains).find((chain: Chain) => chain.chainId === chainId) ??
    {};
  const { transactions: accountTransactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const {
    details: { alias, address },
  } = derived[chainId][id];

  const tokenType = chains[chainId].currency.symbol;
  const token = Tokens[tokenType];

  // eslint-disable-next-line prefer-const
  const transactions = accountTransactions
    .filter(
      (transaction) =>
        (transaction.source === address || transaction.target === address) &&
        transaction.chainId === chainId
    )
    .reverse();

  return (
    <TokenDetailContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <AccountsDetailsNavContainer>
          <Heading level={HeadingLevel.One}>{alias}</Heading>
        </AccountsDetailsNavContainer>
      </NavigationContainer>
      <p>
        <strong>
          {/* TODO: Show balance from balances state! */}
          {/* {balance} */}
          {token.symbol}
        </strong>
      </p>

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
                    {transaction.source === address ? "Sent " : "Received "}(
                    {type}) {amount} {tokenType}
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
    </TokenDetailContainer>
  );
};

export default TokenDetails;
