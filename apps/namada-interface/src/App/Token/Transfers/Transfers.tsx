import { useParams, useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";
import {
  DerivedAccount,
  ShieldedKeysAndPaymentAddress,
  AccountsState,
} from "slices/accounts";
import { TransfersState } from "slices/transfers";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { formatRoute, stringFromTimestamp } from "@anoma/utils";

import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import {
  TransfersContainer,
  TransactionList,
  TransactionListItem,
  ButtonsContainer,
  TransfersContent,
} from "./Transfers.components";
import { BackButton } from "../TokenSend/TokenSendForm.components";
import { Icon, IconName } from "components/Icon";
import { NavigationContainer } from "components/NavigationContainer";
import { TokenType } from "@anoma/tx";

type TokenDetailsParams = {
  id: string;
  token: TokenType;
};

const Transfers = (): JSX.Element => {
  const navigate = useNavigate();
  const { id = "", token } = useParams<TokenDetailsParams>();
  const { derived, shieldedAccounts: shieldedAccountsByChainId } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { transactions: accountTransactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const derivedAccounts = derived[chainId] || {};
  const shieldedAccounts = shieldedAccountsByChainId[chainId] || {};
  const accounts = { ...derivedAccounts, ...shieldedAccounts };

  let shieldedKeysAndPaymentAddress: ShieldedKeysAndPaymentAddress | undefined;

  if (shieldedAccounts && shieldedAccounts[id]) {
    shieldedKeysAndPaymentAddress =
      shieldedAccounts[id].shieldedKeysAndPaymentAddress;
  }

  const account: DerivedAccount = accounts[id] || shieldedAccounts[id] || {};
  const { tokenType, establishedAddress } = account;

  const transactions = accountTransactions
    .filter(
      (transaction) =>
        (transaction.source ===
          (establishedAddress ||
            shieldedKeysAndPaymentAddress?.paymentAddress) ||
          transaction.target ===
            (establishedAddress ||
              shieldedKeysAndPaymentAddress?.paymentAddress)) &&
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
