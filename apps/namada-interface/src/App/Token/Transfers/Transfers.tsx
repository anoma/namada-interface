import { useNavigate } from "react-router-dom";

import { TokenType } from "@namada/types";
import { formatRoute, stringFromTimestamp } from "@namada/utils";
import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  Icon,
  IconName,
  NavigationContainer,
} from "@namada/components";

import { TopLevelRoute } from "App/types";
import { Account, AccountsState } from "slices/accounts";
import { TransfersState, TransferTransaction } from "slices/transfers";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";

import {
  TransfersContainer,
  TransactionList,
  TransactionListItem,
  ButtonsContainer,
  TransfersContent,
} from "./Transfers.components";
import { BackButton } from "../TokenSend/TokenSendForm.components";
import { useSanitizedParams } from "@namada/hooks";

type TokenDetailsParams = {
  id: string;
  token: TokenType;
};

const Transfers = (): JSX.Element => {
  const navigate = useNavigate();
  const { id = "", token } = useSanitizedParams<TokenDetailsParams>();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { transactions: accountTransactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const derivedAccounts = derived[chainId];

  /* let shieldedKeysAndPaymentAddress: ShieldedKeysAndPaymentAddress | undefined; */
  /**/
  /* if (shieldedAccounts && shieldedAccounts[id]) { */
  /*   shieldedKeysAndPaymentAddress = */
  /*     shieldedAccounts[id].shieldedKeysAndPaymentAddress; */
  /* } */

  const account: Account = derivedAccounts[id];
  const {
    details: { address },
  } = account;

  const transactions: TransferTransaction[] = accountTransactions
    .filter(
      (transaction: TransferTransaction) =>
        (transaction.source === address ||
          transaction.source === transaction.target) &&
        transaction.chainId === chainId &&
        transaction.tokenType === token
    )
    .reverse();

  return (
    <TransfersContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Transactions</Heading>
      </NavigationContainer>

      <TransfersContent>
        {transactions.length === 0 && <p>No transactions</p>}
        {transactions.length > 0 && (
          <TransactionList>
            {transactions.map((transaction) => {
              const { appliedHash, amount, timestamp, type, tokenType } =
                transaction;
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
                    variant={ButtonVariant.Contained}
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
      </TransfersContent>

      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </TransfersContainer>
  );
};

export default Transfers;
